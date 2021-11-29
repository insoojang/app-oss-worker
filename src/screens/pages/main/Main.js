import React, { useEffect, useState, useRef } from 'react'
import { NativeModules, ScrollView } from 'react-native'
import NativeEventEmitter from 'react-native/Libraries/EventEmitter/NativeEventEmitter'
import { Camera } from 'expo-camera'
import { useNavigation } from '@react-navigation/native'
import { debounce, isEmpty } from 'lodash-es'
import { useDispatch, useSelector } from 'react-redux'
import { Divider } from 'react-native-elements'
import BleManager from 'react-native-ble-manager'

import ButtonGroup from '../../../components/ButtonGroup'
import { i18nt } from '../../../utils/i18n'
import StateBar from '../../../components/StateBar'
import { SButtongroupContainerView } from '../../../components/ButtonGroupStyle'
import { SSensorListContainerView } from './MainStyle'
import SensorList from './SensorList'
import { permissionsAndroid } from '../../../utils/permissions'
import { SCREEN } from '../../../navigation/constants'
import { WarnAlert } from '../../../components/Alerts'
import { launchFunction } from './func'
import { checkNotifyProperties, isEmptyASCII } from '../../../utils/common'
import { jsonParser, sensorDataParser } from '../../../utils/parser'
import { setListAction } from '../../../redux/reducers'
import { times } from '../../../utils/format'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const Main = (props) => {
    const [bluetoothState, setBluetoothState] = useState(null)
    const [serverConnectionStatus, setServerConnectionStatus] = useState(false)
    const [fastened, setFastened] = useState('-')
    const [loading, setLoading] = useState(false)
    const [timeoutCount, setTimeoutCount] = useState(0)
    const [localSensorList, setLocalSensorList] = useState({})

    const { storeSensorList, storeScanList } = useSelector((state) => state)
    const dispatch = useDispatch()
    const sensorRef = useRef(null)
    const navigation = useNavigation()
    const buttonGroupList = [
        {
            title: i18nt('action.sensor-connection'),
            icon: 'access-point',
            event: () => {
                getCameraPermission()
            },
        },
        { title: i18nt('action.disconnect'), icon: 'cancel' },
    ]

    const getCameraPermission = async () => {
        const { status } = await Camera.requestPermissionsAsync()
        if (status === 'granted') {
            navigation.navigate(SCREEN.Scan)
        } else {
            WarnAlert({
                message: i18nt('error.permission-deny-camera'),
                error: 'Camera Auth',
                // state: setConnectionState,
            })
        }
    }

    const onTriplePress = () => {
        setTimeoutCount(timeoutCount + 1)
        if (timeoutCount > 1) {
            setTimeoutCount(0)
        }
    }
    const test = (newList) => {
        console.log('222@@', newList)
        setLocalSensorList((state) => ({
            [newList.uuid]: newList,
        }))
    }

    const onConnectAndPrepare = async (list) => {
        const { uuid, android } = list

        const clearConnect = await BleManager.isPeripheralConnected(uuid, [])
        if (clearConnect) {
            await BleManager.disconnect(uuid)
        }
        setLoading(true)
        console.log(uuid, 'ble before Launch')

        await launchFunction(() => BleManager.connect(uuid))
        const isPeripheralConnected = await BleManager.isPeripheralConnected(
            uuid,
            [],
        )
        console.log(isPeripheralConnected, 'ble Launch')
        if (isPeripheralConnected) {
            const info = await BleManager.retrieveServices(uuid)
            const { status, characteristic, service } = checkNotifyProperties(
                info,
                'Notify',
            )
            const writeProperties = checkNotifyProperties(info, 'Write')
            if (status === 200) {
                await BleManager.startNotification(
                    uuid,
                    service,
                    characteristic,
                )

                bleManagerEmitter.addListener(
                    'BleManagerDidUpdateValueForCharacteristic',
                    ({ value }) => {
                        const asciiCode = isEmptyASCII(value)

                        const result = JSON.stringify(
                            String.fromCharCode(...asciiCode),
                        )
                        // Convert bytes array to string
                        //fastenedState :
                        // 11 : normal connection
                        // 10 : Abnormal connection
                        // 01 : disConnected
                        // 00 : disConnected
                        const convertData = jsonParser(result)
                        const fastenedState = !isEmpty(result)
                            ? sensorDataParser(convertData)
                            : '-'
                        // setFastened(fastenedState)
                        const newList = Object.assign({}, list, {
                            status: fastenedState,
                        })
                        sensorRef = newList
                        console.log('111', sensorRef)
                        // test(newList)
                        // dispatch(
                        //     setListAction(
                        //         Object.assign({}, list, {
                        //             status: fastenedState,
                        //         }),
                        //     ),
                        // )
                        // const newSensorList = newList.reduce((acc, datum) => {
                        //     if (datum.uuid === list.uuid) {
                        //         acc.push(
                        //             Object.assign({}, list, {
                        //                 status: fastenedState,
                        //             }),
                        //         )
                        //     } else {
                        //         acc.push(datum)
                        //     }
                        //     return acc
                        // }, [])
                        // dispatch(setList(newSensorList))
                        // const newLocalSensorList = localSensorList.map(
                        //     (datum) => {
                        //         if (datum.uuid === list.uuid) {
                        //             acc.push(
                        //                 Object.assign(datum, {
                        //                     status: fastenedState,
                        //                 }),
                        //             )
                        //         } else {
                        //             acc.push(datum)
                        //         }
                        //         return acc
                        //     },
                        //     [],
                        // )
                        // console.log(newLocalSensorList, 'testest')
                        // setLocalSensorList(newLocalSensorList)
                        // console.log(convertData, '@@@@@@@@@@@@@@@@')
                    },
                )
            }
        }
        return list
        // if (isPeripheralConnected) {
        //     const info = await BleManager.retrieveServices(uuid)
        //
        //     const { status, characteristic, service } = checkNotifyProperties(
        //         info,
        //         'Notify',
        //     )
        //     const writeProperties = checkNotifyProperties(info, 'Write')
        //     if (status === 200) {
        //         setFastened('01')
        //         setServerConnectionStatus(true)
        //
        //         await BleManager.startNotification(
        //             uuid,
        //             service,
        //             characteristic,
        //         )
        //         bleManagerEmitter.addListener(
        //             'BleManagerDidUpdateValueForCharacteristic',
        //             ({ value }) => {
        //                 const asciiCode = isEmptyASCII(value)
        //
        //                 const result = JSON.stringify(
        //                     String.fromCharCode(...asciiCode),
        //                 )
        //                 // Convert bytes array to string
        //                 const { server, android } = qrValue
        //                 //fastenedState :
        //                 // 11 : normal connection
        //                 // 10 : Abnormal connection
        //                 // 01 : disConnected
        //                 // 00 : disConnected
        //                 const convertData = jsonParser(result)
        //                 const fastenedState = !isEmpty(result)
        //                     ? sensorDataParser(convertData)
        //                     : '-'
        //                 setFastened(fastenedState)
        //
        //                 const param = {
        //                     empName: name,
        //                     empBirth: birth,
        //                     connected: true,
        //                     fastened: fastenedState,
        //                     battery: convertData?.battery,
        //                     work: workStatusRef.current
        //                         ? 'work_start'
        //                         : 'work_stop',
        //                     atm: barometerRef,
        //                 }
        //                 fetchBluetoothData({
        //                     server,
        //                     resourceKey: android,
        //                     param,
        //                 })
        //             },
        //         )
        //     }
        // }
    }

    const debounceOnConnectAndPrepare = debounce((value) => {
        value
            .filter((list) => list.status === 'scan')
            .map((list) => {
                onConnectAndPrepare(list)
                    .then((list) => {
                        console.log('suc')
                        // SuccessAlert()
                        // if (timeoutCount > 1) {
                        //     setTimeoutCount(0)
                        // }
                        // setLoading(false)
                    })
                    .catch((e) => {
                        // const newList = sensorListRef.current
                        const newSensorList = newList.reduce((acc, datum) => {
                            if (datum.uuid === list.uuid) {
                                axcc.push(
                                    Object.assign({}, datum, {
                                        status: 'error',
                                    }),
                                )
                            } else {
                                acc.push(datum)
                            }
                            return acc
                        }, [])
                        dispatch(setListAction(newSensorList))
                        console.log('error')
                        // sensorErrorAlert(e, timeoutCount, onTriplePress)
                        // onAllClear()
                    })
            })

        // onConnectAndPrepare(value)
        //     .then(() => {
        //         // SuccessAlert()
        //         // if (timeoutCount > 1) {
        //         //     setTimeoutCount(0)
        //         // }
        //         setLoading(false)
        //     })
        //     .catch((e) => {
        //         sensorErrorAlert(e, timeoutCount, onTriplePress)
        //         // onAllClear()
        //     })
    }, 200)

    useEffect(() => {
        BleManager.start({ showAlert: false })
        BleManager.checkState()
        bleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            () => {},
        )
        permissionsAndroid()
        return () => {
            // onAllClear()
        }
    }, [])
    useEffect(() => {
        bleManagerEmitter.addListener('BleManagerDidUpdateState', (args) => {
            if (args?.state !== bluetoothState) {
                setBluetoothState(args.state)
            }
        })
    }, [bluetoothState])

    useEffect(() => {
        //TODO DFU
        // if (serverConnectionStatus) {
        //     fetchVersionData(server)
        // }
        console.log(storeScanList, 'storeSensorList')
        debounceOnConnectAndPrepare(storeScanList)
    }, [storeScanList])
    console.log('')
    console.log('render@@@', sensorRef)
    return (
        <>
            {/*<Spinner*/}
            {/*    visible={loading}*/}
            {/*    overlayColor={'rgba(0, 0, 0, 0.7)'}*/}
            {/*    textStyle={{ color: 'white' }}*/}
            {/*/>*/}
            <SButtongroupContainerView>
                <ButtonGroup groupList={buttonGroupList} />
            </SButtongroupContainerView>
            <ScrollView showsVerticalScrollIndicator={false}>
                {bluetoothState === null || bluetoothState === 'off' ? (
                    <StateBar title={i18nt('alarm.bluetooth-off')} />
                ) : null}
                <SSensorListContainerView>
                    <SensorList
                        list={Object.keys(localSensorList).map(
                            (v) => localSensorList[v],
                        )}
                    />
                </SSensorListContainerView>
                <Divider />
            </ScrollView>
        </>
    )
}

export default Main
