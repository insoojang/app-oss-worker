import { createSlice } from '@reduxjs/toolkit'
import update from 'immutability-helper'

// const QR_STATE = {
//     android: '',
//     ios: '',
//     server: '',
// }
const SENSOR_LIST = []
const initialState = {
    websockets: {
        measurement: {
            isOpened: false,
            readyState: 0,
            timestamp: 0,
            subscribers: {},
        },
        realtime: {
            isOpened: false,
            readyState: 0,
            timestamp: 0,
            subscribers: {},
        },
    },
    subscriptions: {
        measurement: {
            metricData: {},
        },
        realtime: {
            realtimeData: {},
        },
    },
}

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

export const realtimeSlice = createSlice({
    name: 'list',
    initialState: initialState,
    reducers: {
        setRealtimeAction: (state, action) => {
            const { type, readyState, timestamp } = action.payload.event
            const { subscribers } = state.websockets[type]
            let subscription = {
                [type]: {
                    metricData: {},
                },
            }
            return update(state, {
                websockets: {
                    $merge: {
                        [type]: {
                            readyState,
                            timestamp,
                            subscribers,
                        },
                    },
                },
                subscriptions: {
                    $merge: subscription,
                },
            })
        },
        clearRealtimeAction: () => initialState,
    },
})
export const { setListAction, clearListAction } = sensorListSlice.actions
export const { setScanListAction, clearScanListAction } = scanListSlice.actions
export const { setRealtimeAction, clearRealtimeAction } = scanListSlice.actions
export const sensorListReducer = sensorListSlice.reducer
export const scanListReducer = scanListSlice.reducer
export const realtimeReducer = realtimeSlice.reducer

export default { sensorListReducer, scanListReducer, realtimeReducer }
