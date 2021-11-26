import React, { useEffect, useState } from 'react'
import Spinner from 'react-native-loading-spinner-overlay'
import {
    Keyboard,
    NativeEventEmitter,
    NativeModules,
    Platform,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native'

import { responsiveHeight } from 'react-native-responsive-dimensions'
import { Button, ListItem, Text } from 'react-native-elements'

import BleManager from 'react-native-ble-manager'
import { fontSizeSet } from '../../../styles/size'
import { colorSet } from '../../../styles/colors'
import { SMainTabContainerView } from '../../tabs/TabStyle'

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

const ScanComponent = () => {
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(false)

    const peripherals = new Map()
    useEffect(() => {
        bleManagerEmitter.addListener(
            'BleManagerDiscoverPeripheral',
            (args) => {
                if (args && args.name?.startsWith('NKIA')) {
                    console.log('@@@@@@', args)
                    peripherals.set(args.id, args)
                    setList(Array.from(peripherals.values()))
                }
                // The id: args.id
                // The name: args.name
            },
        )
    }, [])

    return (
        <SMainTabContainerView>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                    width: '100%',
                    backgroundColor: colorSet.white,
                }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{ height: responsiveHeight(100) - 91 }}
                >
                    <Spinner visible={false} />
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View
                            style={{
                                flex: 7.5,
                                // padding: '10px 20px',
                                justifyContent: 'space-between',
                            }}
                        >
                            {list.length !== 0 ? (
                                list.map((l, i) => (
                                    <ListItem key={i} bottomDivider>
                                        <ListItem.Content>
                                            <ListItem.Title>
                                                {l.name}
                                            </ListItem.Title>
                                            <ListItem.Subtitle>
                                                {`${
                                                    Platform.OS === 'android'
                                                        ? 'Mac Address'
                                                        : 'ID'
                                                } : ${l.id}`}
                                            </ListItem.Subtitle>
                                        </ListItem.Content>
                                    </ListItem>
                                ))
                            ) : (
                                <Text>NKIA Sensor not found</Text>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                    <View
                        style={{
                            flex: 2.5,
                            justifyContent: 'center',
                            // padding: '0 20px',
                        }}
                    >
                        <Button
                            buttonStyle={{
                                height: 50,
                                fontSize: fontSizeSet.base,
                                marginBottom: 15,
                                backgroundColor: colorSet.primary,
                            }}
                            onPress={() => {
                                BleManager.scan([], 10, true).then(() => {
                                    // Success code
                                    setLoading(true)
                                    console.log('Scan started')
                                })
                                setTimeout(() => {
                                    setLoading(false)
                                }, 5000)
                            }}
                            title={'Scan'}
                        />
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SMainTabContainerView>
    )
}

export default ScanComponent
