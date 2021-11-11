import React from 'react'
import { Text, SafeAreaView } from 'react-native'
import { SMainTabContainerView } from '../../tabs/TabStyle'

const NFCComponent = () => {
    return (
        <SMainTabContainerView>
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: '#fff',
                }}
            >
                <Text>개발중...</Text>
            </SafeAreaView>
        </SMainTabContainerView>
    )
}

export default NFCComponent
