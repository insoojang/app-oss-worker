import styled from 'styled-components/native'
import { fontSizeSet } from '../../../styles/size'
import { colorSet } from '../../../styles/colors'
import { Text } from 'react-native-elements'

export const SMoreHeaderView = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 25px 15px;
    margin: 0 15px 10px;
    border-radius: 4px;
    background: ${colorSet.primary};
`
SMoreHeaderView.displayName = 'SMoreHeaderView'

export const SUserTitleText = styled(Text)`
    font-size: ${fontSizeSet.xxl}px;
    font-weight: bold;
    color: ${colorSet.white};
`
SUserTitleText.displayName = 'SUserTitleText'

export const SMyInfoContainerView = styled.View`
    padding: 0 15px 15px 15px;
`
SMyInfoContainerView.displayName = 'SMyInfoContainerView'
