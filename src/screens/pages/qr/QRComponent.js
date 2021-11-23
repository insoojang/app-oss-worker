import React, { useRef, useState, useEffect } from 'react'
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { isEmpty } from 'lodash-es'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import {
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions'
import Spinner from 'react-native-loading-spinner-overlay'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import {
    SGuidLineWrapperView,
    SQRSubscription,
    SQRView,
    SScanListChip,
    SScanListChipView,
} from './QRComponentStyle'
import { i18nt } from '../../../utils/i18n'
import { WarnAlert } from '../../../components/Alerts'
import { jsonParser } from '../../../utils/parser'
import { qrErrorCheck } from '../../../utils/common'
import { SMainTabContainerView } from '../../tabs/TabStyle'

const QRComponent = () => {
    const [scanned, setScanned] = useState(false)
    const [scanList, setScanList] = useState([])
    const [loading, setLoading] = useState(false)

    const guidLineLayout = useRef({})
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const isScanArea = (cornerPoints) => {
        const guidLine = [
            {
                x: guidLineLayout.current.x,
                y: guidLineLayout.current.y,
            },
            {
                x: guidLineLayout.current.x + guidLineLayout.current.width,
                y: guidLineLayout.current.y,
            },
            {
                x: guidLineLayout.current.x + guidLineLayout.current.width,
                y: guidLineLayout.current.y + guidLineLayout.current.height,
            },
            {
                x: guidLineLayout.current.x,
                y: guidLineLayout.current.y + guidLineLayout.current.height,
            },
        ]

        return (
            cornerPoints[0].x > guidLine[0].x &&
            cornerPoints[0].y > guidLine[0].y &&
            cornerPoints[1].x < guidLine[1].x &&
            cornerPoints[1].y > guidLine[1].y &&
            cornerPoints[2].x < guidLine[2].x &&
            cornerPoints[2].y < guidLine[2].y &&
            cornerPoints[3].x > guidLine[3].x &&
            cornerPoints[3].y < guidLine[3].y
        )
    }

    const onConfirmSensor = (value) => {
        Alert.alert(i18nt('sensor.scan'), '', [
            {
                text: i18nt('action.cancel'),
                style: 'cancel',
                onPress: () => {
                    setScanned(false)
                },
            },
            {
                text: i18nt('action.ok'),
                onPress: () => {
                    try {
                        setLoading(true)
                        let duplicateCheck = scanList.some(
                            (v) => v.android === value.android,
                        )
                        if (duplicateCheck) {
                            setLoading(false)
                            WarnAlert({
                                message: i18nt('sensor.duplicate'),
                                onPress: () => {
                                    setTimeout(() => {
                                        setScanned(false)
                                    }, 2500)
                                },
                            })
                        } else {
                            setScanList(scanList.concat(value))
                            setTimeout(() => {
                                setLoading(false)
                                setScanned(false)
                            }, 1500)
                        }

                        // dispatch(setUuid(value))
                        // navigation.goBack()
                    } catch (e) {
                        console.error('[ERROR]', e)
                    }
                },
            },
        ])
    }

    const handleBarCodeScanned = (props, gallery) => {
        const { data, cornerPoints } = props
        if (!gallery && !isScanArea(cornerPoints)) {
            return
        }
        setScanned(true)
        if (!isEmpty(data)) {
            try {
                let parsingData = jsonParser(data)
                if (qrErrorCheck(parsingData)) {
                    throw new Error('QR Code not recognized.')
                }
                onConfirmSensor(parsingData)
            } catch (e) {
                WarnAlert({
                    message: i18nt('error.qr-recognize'),
                    error: e,
                    onPress: () => {
                        setScanned(false)
                    },
                })
            }
        }
    }

    const styles = StyleSheet.create({
        cameraContainer: {
            marginHorizontal: 0,
            marginLeft: 0,
            marginStart: 0,
            paddingHorizontal: 0,
            paddingLeft: 0,
            paddingStart: 0,
            height: '110%%',
        },
    })

    useEffect(() => {
        navigation.setOptions({
            // headerLeft: null,
            headerRight: () => (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginHorizontal: 15 }}
                    hitSlop={{
                        top: 10,
                        right: 15,
                        bottom: 10,
                        left: 15,
                    }}
                >
                    <Icon name="close" />
                </TouchableOpacity>
            ),
        })
    }, [])

    const chipRender = (list) => {
        const { android } = list
        const title = android?.split(':').slice(-2).join('').toLowerCase()
        return (
            <SScanListChip
                title={title}
                key={android}
                icon={
                    <TouchableOpacity
                        hitSlop={{
                            top: 32,
                            bottom: 32,
                            left: 32,
                            right: 32,
                        }}
                        onPress={() => {
                            const filterList = scanList?.filter(
                                (list) => list.android !== android,
                            )
                            setScanList(filterList)
                        }}
                    >
                        <Icon name="close-thick" size={15} color="white" />
                    </TouchableOpacity>
                }
                iconRight
            />
        )
    }
    return (
        <SMainTabContainerView>
            <Spinner
                visible={loading}
                overlayColor={'rgba(0, 0, 0, 0.7)'}
                textStyle={{ color: 'white' }}
            />
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: '#000000',
                }}
            >
                <SQRView>
                    <BarCodeScanner
                        onBarCodeScanned={
                            scanned ? undefined : handleBarCodeScanned
                        }
                        style={[StyleSheet.absoluteFillObject, styles]}
                    />
                    <SGuidLineWrapperView
                        onLayout={(event) => {
                            guidLineLayout.current = event.nativeEvent.layout
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: 'white',
                                borderWidth: 1,
                                width: responsiveScreenWidth(47),
                                height: responsiveScreenHeight(21),
                            }}
                        />
                    </SGuidLineWrapperView>
                    <SQRSubscription>
                        {i18nt('qr.subscription')}
                    </SQRSubscription>
                    <SScanListChipView>
                        {scanList.map((list) => {
                            return chipRender(list)
                        })}
                    </SScanListChipView>
                </SQRView>
            </SafeAreaView>
        </SMainTabContainerView>
    )
}

export default QRComponent
