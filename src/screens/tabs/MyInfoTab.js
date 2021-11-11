import React from 'react'
import { ScrollView } from 'react-native'
import MyInfo from '../pages/more/MyInfo'
import { colorSet } from '../../styles/colors'

const MyInfoTab = (props) => {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: colorSet.white }}>
            <MyInfo />
        </ScrollView>
    )
}

export default MyInfoTab
