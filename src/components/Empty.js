import React from 'react'
import { View } from 'react-native'

import Box from '../../assets/box.svg'
import { SEmptyDescriptionText, SEmptyImageView } from './EmptyStyle'

const Empty = (props) => {
    const {
        description,
        isImage = true,
        containerStyle,
        contentStyle,
        imgWidth = 80,
        imgHeight = 60,
    } = props
    return (
        <View style={containerStyle}>
            <SEmptyImageView isImage={isImage}>
                <Box width={imgWidth} height={imgHeight} />
            </SEmptyImageView>
            <SEmptyDescriptionText style={contentStyle}>
                {description}
            </SEmptyDescriptionText>
        </View>
    )
}

export default Empty
