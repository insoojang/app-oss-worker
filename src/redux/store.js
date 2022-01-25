import { configureStore } from '@reduxjs/toolkit'
// import logger from 'redux-logger'
import {  scanListReducer } from './reducers'

export default configureStore({
    reducer: {
        storeScanList: scanListReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})
