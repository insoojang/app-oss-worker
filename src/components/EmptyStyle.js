import styled from 'styled-components/native'
import { Text } from 'react-native-elements'
import { fontSizeSet } from '../styles/size'
import { colorSet } from '../styles/colors'

export const SEmptyImageView = styled.View`
    display: ${(props) => (props.isImage ? 'flex' : 'none')};
`
SEmptyImageView.displayName = 'SEmptyImageView'

export const SEmptyDescriptionText = styled(Text)`
    font-size: ${fontSizeSet.base}px;
    margin-top: 5px;
    color: ${colorSet.normalTextColor};
`
SEmptyDescriptionText.displayName = 'SEmptyDescriptionText'
