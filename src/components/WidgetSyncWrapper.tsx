import { useWidgetSync } from '../hooks/useWidgetSync';

/**
 * Widget Sync Wrapper
 * This component must be inside QueryClientProvider to use React Query hooks
 */
export function WidgetSyncWrapper() {
    useWidgetSync();
    return null;
}
