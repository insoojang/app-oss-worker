import React from 'react'
import { SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import { SMainTabContainerView } from './TabStyle'
import { colorSet } from '../../styles/colors'
import { responsiveHeight } from 'react-native-responsive-dimensions'
import { Main } from '../pages/main'

const MainTab = () => {
    return (
        <SMainTabContainerView>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                }}
            >
                <Main />
            </SafeAreaView>
        </SMainTabContainerView>
    )
}

export default MainTab
