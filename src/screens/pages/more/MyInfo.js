import React, { useState, useLayoutEffect } from 'react'
import { View } from 'react-native'
import { colorSet } from '../../../styles/colors'
import { SMyInfoContainerView } from './MoreStyle'
import { i18nt } from '../../../utils/i18n'
import { SCREEN } from '../../../navigation/constants'
import Constants from 'expo-constants'
import { ListItem } from 'react-native-elements'
import { fontSizeSet } from '../../../styles/size'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { isEmpty } from 'lodash-es'

const MyInfo = (props) => {
    const [userData, setUserData] = useState({})

    const items = [
        {
            title: 'name',
        },
        {
            title: 'phone',
        },
        {
            title: 'date-of-birth',
        },
    ]
    const getData = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@userData')
            const response = jsonValue !== {} ? JSON.parse(jsonValue) : {}
            setUserData(response)
        } catch (e) {
            console.log('[ERROR]: MyInfo.js > getData()')
        }
    }
    useLayoutEffect(() => {
        getData()
    }, [])

    return (
        <>
            <SMyInfoContainerView>
                <View>
                    {items.map((item, index) => (
                        <ListItem
                            key={index}
                            containerStyle={{
                                paddingHorizontal: 0,
                            }}
                        >
                            <ListItem.Content>
                                <ListItem.Title
                                    style={{
                                        fontSize: fontSizeSet.base,
                                        color: colorSet.normalTextColor,
                                    }}
                                >
                                    {i18nt(`title.${item.title}`)}
                                </ListItem.Title>

                                <ListItem.Subtitle
                                    style={{
                                        color: colorSet.disableText,
                                        marginTop: 5,
                                    }}
                                >
                                    {!isEmpty(userData)
                                        ? userData[item.title]
                                        : null}
                                </ListItem.Subtitle>
                            </ListItem.Content>
                        </ListItem>
                    ))}
                </View>
            </SMyInfoContainerView>
        </>
    )
}

export default MyInfo
