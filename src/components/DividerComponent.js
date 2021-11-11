import React from 'react'
import { Divider } from 'react-native-elements'
import { colorSet } from '../styles/colors'

const DividerComponent = (props) => {
    return (
        <Divider
            style={{ height: '8px', backgroundColor: colorSet.primaryBg }}
        />
    )
}

export default DividerComponent
