import { createSlice } from '@reduxjs/toolkit'

// const QR_STATE = {
//     android: '',
//     ios: '',
//     server: '',
// }
const SENSOR_LIST = []

export const scanListSlice = createSlice({
    name: 'scanList',
    initialState: SENSOR_LIST,
    reducers: {
        setScanListAction: (state, action) => action.payload,
        clearScanListAction: () => SENSOR_LIST,
    },
})

export const { setScanListAction, clearScanListAction } = scanListSlice.actions
export const scanListReducer = scanListSlice.reducer

export default { scanListReducer }
