import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from './UserSlice'
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER  } from 'redux-persist';

const persistConfig = {
    key: 'root',
    storage,
  }


  const persistedReducer = persistReducer(persistConfig, userReducer);

  export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          warnAfter: 128,
        },
      }),
  });

export const persistor = persistStore(store);