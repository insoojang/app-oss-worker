import styled from 'styled-components/native'
import { fontSizeSet } from '../../../styles/size'
import { colorSet } from '../../../styles/colors'
import { Text } from 'react-native-elements'

export const SSensorListContainerView = styled.View`
    margin-top: 15px;
    padding: 0 15px;
`
SSensorListContainerView.displayName = 'SSensorListContainerView'

export const SSensorListTitleContainerView = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
`
SSensorListTitleContainerView.displayName = 'SSensorListTitleContainerView'

export const SSensorListTitleView = styled(Text)`
    font-size: ${fontSizeSet.base}px;
    font-weight: bold;
    color: ${colorSet.normalTextColor};
    margin-right: 10px;
`
SSensorListTitleView.displayName = 'SSensorListTitleView'

export const SSensorListView = styled.View`
    justify-content: center;
    //align-items: center;
`
SSensorListView.displayName = 'SSensorListView'
