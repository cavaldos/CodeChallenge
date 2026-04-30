import countSlice from '~/redux/features/countSlice';
import themeSlice from '~/redux/features/themeSlice';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';

// Create a custom storage adapter that wraps localStorage
const storage = {
    getItem: (key: string) => {
        const value = localStorage.getItem(key);
        return Promise.resolve(value);
    },
    setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
    },
    removeItem: (key: string) => {
        localStorage.removeItem(key);
        return Promise.resolve();
    },
};

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['count', 'theme'],
};
const rootReducer = combineReducers({
    count: countSlice,
    theme: themeSlice,
});
    
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
