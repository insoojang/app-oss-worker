import React from 'react'
import { SafeAreaView } from 'react-native'
import { SMainTabContainerView } from './TabStyle'
import { More } from '../pages/more'

const MoreTab = () => {
    return (
        <SMainTabContainerView>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                }}
            >
                <More />
            </SafeAreaView>
        </SMainTabContainerView>
    )
}

export default MoreTab
