import { configureStore } from '@reduxjs/toolkit'
// import logger from 'redux-logger'
import { sensorListReducer, scanListReducer } from './reducers'

export default configureStore({
    reducer: {
        storeSensorList: sensorListReducer,
        storeScanList: scanListReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})
