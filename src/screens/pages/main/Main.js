import React, { useEffect, useState } from 'react'
import { NativeModules, ScrollView } from 'react-native'
import NativeEventEmitter from 'react-native/Libraries/EventEmitter/NativeEventEmitter'
import { Camera } from 'expo-camera'
import { useNavigation } from '@react-navigation/native'

import ButtonGroup from '../../../components/ButtonGroup'
import { i18nt } from '../../../utils/i18n'
import StateBar from '../../../components/StateBar'
import { SButtongroupContainerView } from '../../../components/ButtonGroupStyle'
import { SSensorListContainerView } from './MainStyle'
import SensorList from './SensorList'
import { Divider } from 'react-native-elements'
import BleManager from 'react-native-ble-manager'
import { permissionsAndroid } from '../../../utils/permissions'
import { SCREEN } from '../../../navigation/constants'
import { WarnAlert } from '../../../components/Alerts'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const Main = () => {
    const [bluetoothState, setBluetoothState] = useState(null)
    const navigation = useNavigation()

    const buttonGroupList = [
        {
            title: i18nt('action.connection'),
            icon: 'access-point',
            event: () => {
                getCameraPermission()
            },
            // route: SCREEN.Scan,
        },
        { title: i18nt('action.disconnect'), icon: 'cancel' },
    ]

    const sensorList = [
        { name: 'NKIA123123', fastened: '11' },
        { name: 'NKIA456456', fastened: '00' },
        { name: 'NKIA789789', fastened: '00' },
        { name: 'NKIA009909', fastened: '00' },
        { name: 'NKIA121212', fastened: '00' },
    ]
    const getCameraPermission = async () => {
        const { status } = await Camera.requestPermissionsAsync()
        console.log('test', status)
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
    return (
        <>
            <SButtongroupContainerView>
                <ButtonGroup groupList={buttonGroupList} />
            </SButtongroupContainerView>
            <ScrollView showsVerticalScrollIndicator={false}>
                {bluetoothState === null || bluetoothState === 'off' ? (
                    <StateBar title={i18nt('alarm.bluetooth-off')} />
                ) : null}
                <SSensorListContainerView>
                    <SensorList list={sensorList} />
                </SSensorListContainerView>
                <Divider />
            </ScrollView>
        </>
    )
}

export default Main
