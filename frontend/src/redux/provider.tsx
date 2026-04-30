import React from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from '~/redux/store';
import { Provider } from 'react-redux';
import store from '~/redux/store';

const ProviderGlobal = ({ children }: { children: React.ReactNode }) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
};
export default ProviderGlobal;
