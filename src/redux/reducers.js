import { createSlice } from '@reduxjs/toolkit'

// const QR_STATE = {
//     android: '',
//     ios: '',
//     server: '',
// }
const SENSOR_LIST = []

export const sensorListSlice = createSlice({
    name: 'list',
    initialState: SENSOR_LIST,
    reducers: {
        setListAction: (state, action) => {
            console.log('state--', state)
            console.log('action.payload--', action.payload)
            if (state.length === 0) {
                return [...state, action.payload]
            }
            const newList = state.reduce((acc, datum) => {
                if (datum?.uuid === action.payload.uuid) {
                    acc.push(
                        Object.assign({}, datum, {
                            status: action.payload.status,
                        }),
                    )
                } else {
                    acc.push(...state, action.payload)
                }
                return acc
            }, [])
            console.log('newList--', newList)
            return newList
            // return [...state, ...action.payload]
        },
        clearListAction: () => SENSOR_LIST,
    },
})

export const scanListSlice = createSlice({
    name: 'scanList',
    initialState: SENSOR_LIST,
    reducers: {
        setScanListAction: (state, action) => action.payload,
        clearScanListAction: () => SENSOR_LIST,
    },
})

export const { setListAction, clearListAction } = sensorListSlice.actions
export const { setScanListAction, clearScanListAction } = scanListSlice.actions
export const sensorListReducer = sensorListSlice.reducer
export const scanListReducer = scanListSlice.reducer

export default { sensorListReducer, scanListReducer }
