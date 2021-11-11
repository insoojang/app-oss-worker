import { createSlice } from '@reduxjs/toolkit'

// const QR_STATE = {
//     android: '',
//     ios: '',
//     server: '',
// }
const QR_STATE = []
export const qrSlice = createSlice({
    name: 'uuid',
    initialState: QR_STATE,
    reducers: {
        setUuid: (state, action) => action.payload,
        clearUuid: () => [],
    },
})

export const { setUuid, clearUuid } = qrSlice.actions

export default qrSlice.reducer

