// Google Play Billing for the optional one-time Remove Ads entitlement.
// The purchase plugin is only initialised on a native build; browser previews
// continue to run without a store bridge.
import { Platform, ProductType, store } from 'capacitor-plugin-cdv-purchase';
import { isNative } from './platform';

export const REMOVE_ADS_ID = 'remove_ads';

type PurchaseResult =
  | { ok: true }
  | { ok: false; reason: 'unavailable' | 'not-ready' | 'failed' };

let started = false;
let owned = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach(fn => fn());
export const onPurchasesChange = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function refreshOwnership() {
  try { owned = store.owned(REMOVE_ADS_ID); } catch { owned = false }
  emit();
}

/** True after Google Play reports the non-consumable as owned. */
export const adsRemoved = () => owned;

/** Start billing and restore a previously purchased entitlement. */
export async function initPurchases() {
  if (!isNative() || started) return;
  started = true;
  try {
    store.register({ id: REMOVE_ADS_ID, type: ProductType.NON_CONSUMABLE, platform: Platform.GOOGLE_PLAY });
    store.when()
      .productUpdated(product => { if (product.id === REMOVE_ADS_ID) refreshOwnership() })
      .receiptUpdated(() => refreshOwnership())
      .approved(transaction => {
        if (transaction.products.some(product => product.id === REMOVE_ADS_ID)) {
          refreshOwnership();
          // A non-consumable must be acknowledged after the entitlement is delivered.
          void transaction.finish().catch(() => undefined);
        }
      });
    const errors = await store.initialize([Platform.GOOGLE_PLAY]);
    if (errors.length) console.warn('Google Play Billing initialisation:', errors);
    refreshOwnership();
  } catch (error) {
    started = false;
    console.warn('Google Play Billing unavailable:', error);
  }
}

export async function buyRemoveAds(): Promise<PurchaseResult> {
  if (!isNative()) return { ok: false, reason: 'unavailable' };
  if (adsRemoved()) return { ok: true };
  const product = store.get(REMOVE_ADS_ID);
  const offer = product?.getOffer();
  if (!offer) return { ok: false, reason: 'not-ready' };
  try {
    const error = await offer.order();
    return error ? { ok: false, reason: 'failed' } : { ok: true };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

export async function restoreRemoveAds(): Promise<PurchaseResult> {
  if (!isNative()) return { ok: false, reason: 'unavailable' };
  try {
    const error = await store.restorePurchases();
    refreshOwnership();
    return error ? { ok: false, reason: 'failed' } : { ok: true };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
