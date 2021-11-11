import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { Platform } from 'react-native'
import { i18nt } from '../../../utils/i18n'
import { Input, Button } from 'react-native-elements'
import { fontSizeSet } from '../../../styles/size'
import { debounce, isEmpty } from 'lodash-es'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SCREEN } from '../../../navigation/constants'

import { WarnAlert } from '../../../components/Alerts'
import {
    SLoginContainerView,
    SLoginHeaderView,
    SLoginInfoText,
    SLoginInfoView,
} from './LoginStyle'
import { colorSet } from '../../../styles/colors'

const Login = (props) => {
    const navigation = useNavigation()

    const [name, setName] = useState()
    const [phone, setPhone] = useState()

    useEffect(() => {
        if (!isEmpty(phone)) {
            setPhone(
                phone
                    .replace(/-/g, '')
                    .replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
            )
        }
    }, [phone])
    const storeData = async ({ name, phone }) => {
        try {
            const jsonValue = JSON.stringify({ name, phone })
            await AsyncStorage.setItem('@userData', jsonValue)
        } catch (e) {
            console.error('[ERROR]: set storeData')
            // saving error
        }
    }
    const onPressNext = debounce(({ name, phone }) => {
        storeData({ name, phone })
        navigation.navigate(SCREEN.MainTab)
    }, 200)

    return (
        <SLoginContainerView
            style={{
                paddingTop: Platform.OS === 'ios' ? 80 : 40,
            }}
        >
            <SLoginHeaderView>
                <SLoginInfoText>{i18nt('login.header')}</SLoginInfoText>
            </SLoginHeaderView>
            <SLoginInfoView>
                <Input
                    placeholder={i18nt('login.name')}
                    returnKeyType="next"
                    clearButtonMode="always"
                    containerStyle={{
                        paddingHorizontal: 0,
                    }}
                    inputContainerStyle={{
                        backgroundColor: colorSet.primaryBg,
                        borderColor: 'transparent',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                    }}
                    inputStyle={{
                        fontSize: fontSizeSet.sm,
                        color: colorSet.normalTextColor,
                    }}
                    maxLength={20}
                    onChangeText={setName}
                />
                <Input
                    placeholder={i18nt('login.phone-number')}
                    returnKeyType="go"
                    clearButtonMode="always"
                    value={phone}
                    containerStyle={{
                        paddingHorizontal: 0,
                    }}
                    inputContainerStyle={{
                        backgroundColor: colorSet.primaryBg,
                        borderColor: 'transparent',
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                    }}
                    inputStyle={{
                        fontSize: fontSizeSet.sm,
                        color: colorSet.normalTextColor,
                    }}
                    keyboardType={'phone-pad'}
                    maxLength={13}
                    onChangeText={setPhone}
                    // onSubmitEditing={() =>
                    //     !isEmpty(userPw) &&
                    //     onPressLogin(userId, userPw)
                    // }
                />
                <Button
                    onPress={() => onPressNext({ name, phone })}
                    buttonType="text"
                    title={i18nt('login.next')}
                    buttonStyle={{
                        backgroundColor: colorSet.primary,
                        borderRadius: 2,
                        paddingVertical: 20,
                        marginVertical: 10,
                    }}
                    disabled={
                        isEmpty(name) || isEmpty(phone) || phone.length < 12
                    }
                />
                <Button
                    buttonType="text"
                    title={i18nt('login.manager-mode')}
                    type="clear"
                    titleStyle={{
                        color: colorSet.normalTextColor,
                        fontSize: fontSizeSet.sm,
                    }}
                    onPress={() => {
                        WarnAlert({ message: '서비스 개발중...' })
                    }}
                />
            </SLoginInfoView>
        </SLoginContainerView>
    )
}

export default Login
