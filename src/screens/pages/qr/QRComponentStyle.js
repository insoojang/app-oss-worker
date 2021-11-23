import styled from 'styled-components/native'
import {
    responsiveScreenHeight,
    responsiveScreenWidth,
} from 'react-native-responsive-dimensions'
import { fontSizeSet } from '../../../styles/size'
import { colorSet } from '../../../styles/colors'
import { Chip } from 'react-native-elements'

export const SQRView = styled.View`
    flex: 1;
    align-items: center;
`
SQRView.displayName = 'SQRView'
export const SQRScanView = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    width: ${responsiveScreenWidth(100)}px;
    height: ${responsiveScreenHeight(100)}px;
`
SQRScanView.displayname = 'SQRScanView'

export const SQRSubscription = styled.Text`
    font-size: ${fontSizeSet.md}px;
    width: 70%;
    color: ${colorSet.white};
    text-align: center;
`
SQRSubscription.displayName = 'SQRSubscription'

export const SGuidLineWrapperView = styled.View`
    margin-bottom: 25px;
    margin-top: 150px;
`
SGuidLineWrapperView.displayname = 'SGuidLineWrapperView'

export const SScanListChipView = styled.View`
    margin-top: 30px;
    flex-direction: row;
    flex-wrap: wrap;
    flex: 1;
    justify-content: space-around;
`
SScanListChipView.displayname = 'SScanListChipView'

export const SScanListChip = styled(Chip)`
    margin-right: 15px;
`
SScanListChip.displayname = 'SScanListChip'
