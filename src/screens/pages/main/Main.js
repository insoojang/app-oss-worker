import React, { useEffect, useRef, useState } from 'react'
import { NativeModules, ScrollView } from 'react-native'
import NativeEventEmitter from 'react-native/Libraries/EventEmitter/NativeEventEmitter'
import { Camera } from 'expo-camera'
import { useNavigation } from '@react-navigation/native'
import { debounce, isEmpty } from 'lodash-es'
import { useDispatch, useSelector } from 'react-redux'
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
import { launchFunction, sensorErrorAlert } from './func'
import { checkNotifyProperties, isEmptyASCII } from '../../../utils/common'
import { jsonParser, sensorUuidParser } from '../../../utils/parser'
import useInterval from '../../../utils/useInterval'
import SensorLog from './SensorLog'
import { clearScanListAction } from '../../../redux/reducers'
import Spinner from 'react-native-loading-spinner-overlay'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const Main = () => {
    const [bluetoothState, setBluetoothState] = useState(null)
    const [serverConnectionStatus, setServerConnectionStatus] = useState(false)
    const [fastened, setFastened] = useState('-')
    const [loading, setLoading] = useState(false)
    const [timeoutCount, setTimeoutCount] = useState(0)
    const [localSensorList, setLocalSensorList] = useState({})
    const [deleteList, setDeleteList] = useState({})
    const [deleteMode, setDeleteMode] = useState(false)

    const { storeScanList } = useSelector((state) => state)
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

    useInterval(() => {
        setLocalSensorList((prev) =>
            Object.keys(bufferRef.current).map(
                (list) => bufferRef.current[list],
            ),
        )
    }, 5000)

    const onConnectAndPrepare = async (list) => {
        const { uuid, android, server } = list
        sensorRef.current = list
        setLoading(true)

        const clearConnect = await BleManager.isPeripheralConnected(uuid, [])
        if (clearConnect) {
            await BleManager.disconnect(uuid)
        }
        console.log('ble stand', uuid)
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

            if (status === 200) {
                await BleManager.startNotification(
                    uuid,
                    service,
                    characteristic,
                )

                const isPeripheralConnected = await BleManager.isPeripheralConnected(
                    uuid,
                    [],
                )
                console.log('@@end', isPeripheralConnected)
                const writeProperties = checkNotifyProperties(info, 'Write')

                BleManager.write(
                    uuid,
                    writeProperties.service,
                    writeProperties.characteristic,
                    [104, 101, 97, 108, 116, 104],
                )
                    .then(() => {
                        // Success code
                        console.log('WriteSuccess')
                    })
                    .catch((error) => {
                        // Failure code
                        console.log(`[ERROR-write]: ${error}`)
                    })
                bufferRef.current[list.sensorName] = Object.assign({}, list, {
                    status: 'scan',
                })
            }
        }
    }

    const onClearNoti = async (peripheral) => {
        console.log('onClearNoti', peripheral)
        const info = await BleManager.retrieveServices(peripheral)
        const { characteristic, service } = checkNotifyProperties(info)
        console.log('@@@stopNotification', peripheral, service, characteristic)
        await BleManager.stopNotification(peripheral, service, characteristic)
        console.log('stopNotification')
    }

    const onDisconnect = debounce((peripheral) => {
        console.log('onDisconnect', peripheral)
        if (peripheral) {
            BleManager.disconnect(peripheral).then(() => {
                console.log('disconnect')
            })
        }
    }, 200)

    const debounceOnConnectClear = debounce(async (list) => {
        const { uuid } = list
        if (!isEmpty(uuid)) {
            delete bufferRef.current[list.sensorName]
            setLocalSensorList((prev) =>
                Object.keys(bufferRef.current).map(
                    (list) => bufferRef.current[list],
                ),
            )
            const isPeripheralConnected = await BleManager.isPeripheralConnected(
                uuid,
                [],
            )
            console.log('isPeripheralConnected', isPeripheralConnected)
            if (isPeripheralConnected) {
                console.log('debounceOnConnectClear isPeripheralConnected')
                await onClearNoti(uuid)
                await onDisconnect(uuid)
                await dispatch(clearScanListAction())
            }

            // onDisconnectService()
        }
        // bleManagerEmitter.removeAllListeners(
        //     'BleManagerDidUpdateValueForCharacteristic',
        // )
        // bleManagerEmitter.removeAllListeners('BleManagerDidUpdateState')
    }, 200)

    const debounceOnConnectAndPrepare = debounce((value) => {
        value
            .filter((list) => list.status === 'scan')
            .map((list) => {
                onConnectAndPrepare(list)
                    .then(() => {
                        console.log('Connection Success')

                        // SuccessAlert()
                        // if (timeoutCount > 1) {
                        //     setTimeoutCount(0)
                        // }
                        setLoading(false)
                    })
                    .catch((e) => {
                        // bufferRef.current[list.sensorName] = newSensor
                        setLoading(false)
                        console.error('[ERROR]-onConnectAndPrepare', e)
                        if (bufferRef.current[list.sensorName]) {
                            bufferRef.current[list.sensorName].status = 'error'
                        } else {
                            bufferRef.current[list.sensorName] = Object.assign(
                                {},
                                list,
                                {
                                    status: 'error',
                                },
                            )
                        }
                        sensorErrorAlert(e, timeoutCount, onTriplePress)
                        setDeleteMode(true)
                        debounceOnConnectClear()
                    })
            })
    }, 200)

    useEffect(() => {
        BleManager.start({ showAlert: false })
        BleManager.checkState()
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', () => {
            if (!isEmpty(bufferRef.current)) {
                Object.keys(bufferRef.current).map((keys) => {
                    console.log('Sudden disconnection', sensorUuidParser(keys))
                    debounceOnConnectClear(sensorUuidParser(keys))
                })
            }
        })
        bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value }) => {
                const asciiCode = isEmptyASCII(value)

                const result = JSON.stringify(String.fromCharCode(...asciiCode))
                const convertData = jsonParser(result)
                const uuid = sensorUuidParser(convertData?.name)

                BleManager.retrieveServices(uuid)
                    .then((info) => {
                        if (info) {
                            const writeProperties = checkNotifyProperties(
                                info,
                                'Write',
                            )
                            BleManager.write(
                                uuid,
                                writeProperties.service,
                                writeProperties.characteristic,
                                [104, 101, 97, 108, 116, 104],
                            )
                                .then(() => {
                                    // Success code
                                    console.log('WriteSuccess')
                                })
                                .catch((error) => {
                                    // Failure code
                                    console.log(`[ERROR-write]: ${error}`)
                                })
                        }
                    })
                    .catch((error) => {
                        // Failure code
                        console.log(`[ERROR-retrieveServices]: ${error}`)
                    })

                if (bufferRef.current[convertData.name]) {
                    bufferRef.current[convertData.name].status = 'success'
                    bufferRef.current[convertData.name].data = convertData
                } else {
                    new Error('not found fastenedState Object')
                }
            },
        )
        permissionsAndroid()
        return () => {
            console.log('unmount')
            bleManagerEmitter.removeAllListeners(
                'BleManagerDidUpdateValueForCharacteristic',
            )
            bleManagerEmitter.removeAllListeners('BleManagerDidUpdateState')
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
        debounceOnConnectAndPrepare(storeScanList)
    }, [storeScanList])

    useEffect(() => {
        if (!isEmpty(deleteList)) {
            debounceOnConnectClear(deleteList)
        }
    }, [deleteList])

    return (
        <>
            <Spinner visible={loading} />
            <SButtongroupContainerView>
                <ButtonGroup groupList={buttonGroupList} />
            </SButtongroupContainerView>
            <ScrollView showsVerticalScrollIndicator={false}>
                {bluetoothState === null || bluetoothState === 'off' ? (
                    <StateBar title={i18nt('alarm.bluetooth-off')} />
                ) : null}
                <SSensorListContainerView>
                    <SensorList
                        list={localSensorList}
                        deleteMode={deleteMode}
                        setDeleteList={setDeleteList}
                    />
                </SSensorListContainerView>
                <SSensorListContainerView>
                    <SensorLog data={bufferRef.current} />
                </SSensorListContainerView>
            </ScrollView>
        </>
    )
}

export default Main
