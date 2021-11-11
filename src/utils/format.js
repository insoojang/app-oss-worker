import moment from 'moment'
import React from 'react'

const times = {
    getDefaultFormat: (timestamp) => {
        return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
    },

    getFormattedMin: (time) => moment(time).format('YY-MM-DD HH:mm'),
    getFromNow: (time) => moment(time).fromNow(),
    getFormattedDay: (time) => moment(time).format('YY-MM-DD'),
    getFormattedDayMin: (time) => moment(time).format('YY-MM-DD HH:mm:ss'),
    getCalenderLocaleFormat: () => {
        //for CalendarPicker
        const locale = moment.locale()
        const labels = {
            en: {
                weekdays: null,
                months: null,
                previousTitle: 'Previous',
                nextTitle: 'Next',
                selectMonthTitle: 'Select Month in',
                selectYearTitle: 'Select Year',
            },
            ko: {
                weekdays: ['일', '월', '화', '수', '목', '금', '토'],
                months: [
                    '1월',
                    '2월',
                    '3월',
                    '4월',
                    '5월',
                    '6월',
                    '7월',
                    '8월',
                    '9월',
                    '10월',
                    '11월',
                    '12월',
                ],
                previousTitle: '이전',
                nextTitle: '다음',
                selectMonthTitle: '',
                selectYearTitle: '년도',
            },
        }
        return labels[locale]
    },
}

export const getEllipsis = (text, length) => {
    if (!length) {
        if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) {
            if (text.length > 8) {
                return text.substring(0, 8).concat('...')
            }
            return text
        }
        if (text.length > 15) {
            return text.substring(0, 15).concat('...')
        }
        return text
    }

    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) {
        if (text.length > length / 2) {
            return text.substring(0, length / 2).concat('...')
        }
        return text
    }
    if (text.length > length) {
        return text.substring(0, length).concat('...')
    }
    return text
}

export { times }
