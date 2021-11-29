import { percentageCalc, sensorDataCheck } from './common'

const jsonParser = (value) => {
    let originData = typeof value === 'object' ? value : JSON.parse(value)
    return typeof originData === 'object' ? originData : JSON.parse(originData)
}
const sensorDataParser = (value) => {
    if (sensorDataCheck(value)) {
        return '00'
    }
    const { tilt_sensor, proximity_sensor } = value
    const data = percentageCalc(proximity_sensor, 16384)
    let sensorData = []
    // if (proximity_sensor > 16360) {
    //     return '3'
    // } else
    if (proximity_sensor > 8000) {
        sensorData.push('1')
    } else {
        sensorData.push('0')
    }
    sensorData.push(tilt_sensor)
    return sensorData.join('')
}
const sensorTitleParser = (value) => {
    if (value !== null && value !== undefined && typeof value === 'string') {
        return value?.split(':').slice(-2).join('').toLowerCase()
    } else {
        const e = new Error('Value is Empty or not String ')
        e.name = 'sensorTitleParser error'
        throw e
    }
}
export { jsonParser, sensorDataParser, sensorTitleParser }
