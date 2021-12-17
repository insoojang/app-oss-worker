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
import { saveBluetooteData } from '../../../service/api/bluetooth.service'
import { times } from '../../../utils/format'
import useInterval from '../../../utils/useInterval'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const Main = (props) => {
    const [bluetoothState, setBluetoothState] = useState(null)
    const [serverConnectionStatus, setServerConnectionStatus] = useState(false)
    const [fastened, setFastened] = useState('-')
    const [loading, setLoading] = useState(false)
    const [timeoutCount, setTimeoutCount] = useState(0)
    const [localSensorList, setLocalSensorList] = useState({})
    const [deleteList, setDeleteList] = useState({})
    const [deleteMode, setDeleteMode] = useState(false)

    const { storeSensorList, storeScanList } = useSelector((state) => state)
    const dispatch = useDispatch()
    const sensorRef = useRef(null)
    const bufferRef = useRef({})
    const timerRef = useRef(null)
    const navigation = useNavigation()
    const buttonGroupList = [
        {
            title: i18nt('action.sensor-connection'),
            icon: 'access-point',
            event: () => {
                getCameraPermission()
            },
            disabled: deleteMode,
        },
        {
            title: i18nt('action.disconnect'),
            icon: 'cancel',
            event: () => {
                setDeleteMode(!deleteMode)
            },
        },
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
    const clearBluetoothDataTimer = () => {
        if (timerRef?.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    useInterval(() => {
        console.log('buffer end ', bufferRef.current)
        // if (!isEmpty(bufferRef.current)) {
        setLocalSensorList(bufferRef.current)
        // }
    }, 5000)

    useEffect(() => {
        bleManagerEmitter.removeAllListeners(
            'BleManagerDidUpdateValueForCharacteristic',
        )
        bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value }) => {
                const asciiCode = isEmptyASCII(value)

                const result = JSON.stringify(String.fromCharCode(...asciiCode))

                console.log(result, '@@@@')
                const convertData = jsonParser(result)
                const fastenedState = !isEmpty(result)
                    ? sensorDataParser(convertData)
                    : '-'

                if (bufferRef.current[convertData.name]) {
                    bufferRef.current[convertData.name].status = fastenedState
                }
            },
        )
    }, [])

    const onConnectAndPrepare = async (list) => {
        const { uuid, android, server } = list
        sensorRef.current = list

        const clearConnect = await BleManager.isPeripheralConnected(uuid, [])
        if (clearConnect) {
            await BleManager.disconnect(uuid)
        }
        setLoading(true)
        console.log('ble stand')
        await launchFunction(() => BleManager.connect(uuid))
        const isPeripheralConnected = await BleManager.isPeripheralConnected(
            uuid,
            [],
        )
        console.log('ble Start', isPeripheralConnected)
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

                if (bufferRef.current[list.sensorName]) {
                    bufferRef.current[list.sensorName] = Object.assign(
                        {},
                        list,
                        { status: 'scan' },
                    )
                } else {
                    const name = list.sensorName
                    bufferRef.current = {
                        [name]: Object.assign({}, list, { status: 'scan' }),
                    }
                }
            }
        }
        return list
    }
    const onClearNoti = async (peripheral) => {
        const info = await BleManager.retrieveServices(peripheral)
        const { characteristic, service } = checkNotifyProperties(info)
        await BleManager.stopNotification(peripheral, service, characteristic)
        console.log('stopNotification')
    }
    const onDisconnect = debounce((peripheral) => {
        if (peripheral) {
            BleManager.disconnect(peripheral).then(() => {
                console.log('disconnect')
            })
        }
    }, 200)

    const debounceOnConnectClear = debounce(async (list) => {
        const { uuid } = list
        if (!isEmpty(uuid)) {
            const isPeripheralConnected = await BleManager.isPeripheralConnected(
                uuid,
                [],
            )
            if (isPeripheralConnected) {
                console.log('isPeripheralConnected')
                await onClearNoti(uuid)
                await onDisconnect(uuid)
            }

            // onDisconnectService()
        }
        bleManagerEmitter.removeAllListeners(
            'BleManagerDidUpdateValueForCharacteristic',
        )
        bleManagerEmitter.removeAllListeners('BleManagerDidUpdateState')
    }, 200)

    const debounceOnConnectAndPrepare = debounce((value) => {
        value
            .filter((list) => list.status === 'scan')
            .map((list) => {
                onConnectAndPrepare(list)
                    .then(() => {
                        console.log('Connecttion Success')
                        // SuccessAlert()
                        // if (timeoutCount > 1) {
                        //     setTimeoutCount(0)
                        // }
                        // setLoading(false)
                    })
                    .catch((e) => {
                        console.error('[ERROR]', e)
                        if (bufferRef.current[list.sensorName]) {
                            bufferRef.current[
                                list.sensorName
                            ] = Object.assign({}, list, { status: 'error' })
                        } else {
                            const name = list.sensorName
                            bufferRef.current = {
                                [name]: Object.assign({}, list, {
                                    status: 'error',
                                }),
                            }
                        }
                        // sensorErrorAlert(e, timeoutCount, onTriplePress)
                        // onAllClear()
                    })
            })
    }, 200)

    useEffect(() => {
        BleManager.start({ showAlert: false })
        BleManager.checkState()
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', () => {
            // console.log('disConnect', sensorRef.current)
            // if (sensorRef.current) {
            //     disconnectError(sensorRef.current)
            // }
        })
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

    const setList = (list) => {
        setLocalSensorList(list)
    }

    useEffect(() => {
        //TODO DFU
        // if (serverConnectionStatus) {
        //     fetchVersionData(server)
        // }
        // setList(storeScanList)
        debounceOnConnectAndPrepare(storeScanList)
    }, [storeScanList])

    const disconnectError = (list) => {
        setLocalSensorList((state) =>
            state.reduce((acc, datum) => {
                if (datum.uuid === list.uuid) {
                    let newSensor = Object.assign({}, datum, {
                        status: 'error',
                    })
                    acc.push(newSensor)
                } else {
                    acc.push(datum)
                }
                return acc
            }, []),
        )
    }

    useEffect(() => {
        if (!isEmpty(deleteList)) {
            debounceOnConnectClear(deleteList)
        }
    }, [deleteList])

    console.log('sensor', localSensorList)
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
                            (list) => localSensorList[list],
                        )}
                        deleteMode={deleteMode}
                        setDeleteList={setDeleteList}
                    />
                </SSensorListContainerView>
                <Divider />
            </ScrollView>
        </>
    )
}

export default Main
