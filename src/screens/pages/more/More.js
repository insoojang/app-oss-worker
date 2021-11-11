import React, { useLayoutEffect, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import { SMoreHeaderView, SUserTitleText } from './MoreStyle'
import { ListItem, Text } from 'react-native-elements'
import { View } from 'react-native'
import { colorSet } from '../../../styles/colors'
import { i18nt } from '../../../utils/i18n'
import { SCREEN } from '../../../navigation/constants'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { fontSizeSet } from '../../../styles/size'
import Constants from 'expo-constants'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const More = () => {
    const [userData, setUserData] = useState({})

    const navigation = useNavigation()
    const items = [
        {
            title: i18nt('title.my-info'),
            icon: 'cog-outline',
            screen: SCREEN.MyInfoTab,
        },
        {
            title: i18nt('title.app-version'),
            icon: 'cellphone',
            content: Constants.manifest.version,
        },
    ]
    const Logout = async () => {
        try {
            await AsyncStorage.removeItem('@userData')
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: SCREEN.LoginTab,
                    },
                ],
            })
        } catch (e) {
            console.log('[ERROR]: More.js > Logout()', e)
        }
    }
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
        <ScrollView>
            <SMoreHeaderView>
                <SUserTitleText>{userData?.name}</SUserTitleText>
                <TouchableOpacity
                    onPress={() => Logout()}
                    style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 50,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                    }}
                >
                    <Text
                        style={{
                            color: colorSet.white,
                        }}
                    >
                        {i18nt('action.logout')}
                    </Text>
                </TouchableOpacity>
            </SMoreHeaderView>
            <View>
                {items.map((item, index) => (
                    <ListItem
                        key={index}
                        onPress={() => {
                            if (item.screen) {
                                navigation.navigate(item.screen)
                            }
                        }}
                    >
                        <Icon name={item.icon} size={20} />
                        <ListItem.Content>
                            <ListItem.Title
                                style={{
                                    fontSize: fontSizeSet.base,
                                    paddingVertical: 5,
                                }}
                            >
                                {item.title}
                            </ListItem.Title>
                        </ListItem.Content>
                        {item.hasOwnProperty('content') === false ? (
                            <ListItem.Chevron />
                        ) : (
                            <Text>{item.content}</Text>
                        )}
                    </ListItem>
                ))}
            </View>
        </ScrollView>
    )
}

export default More
