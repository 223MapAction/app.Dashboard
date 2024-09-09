import React, { createContext, useContext, useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const DateFilterContext = createContext();

export const DateFilterProvider = ({ children }) => {
    const [filterType, setFilterType] = useState('today');
    const [customRange, setCustomRange] = useState([{
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    }]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (ranges) => {
        const { selection } = ranges;
        console.log(ranges); 
        setCustomRange([selection]);
    };
    
    const applyCustomRange = () => {
        const start = customRange[0].startDate.toISOString().split('T')[0];
        const end = customRange[0].endDate.toISOString().split('T')[0];
        handleFilterChange('custom_range', start, end);
    };

    const handleFilterChange = (type, startDate = null, endDate = null) => {
        setFilterType(type);
        if (type === 'custom_range') {
            setShowDatePicker(true); 
        } else {
            setShowDatePicker(false);
        }

        switch (type) {
            case 'today':
                setCustomRange([{
                    startDate: new Date(),
                    endDate: new Date(),
                }]);
                break;
            case 'yesterday':
                const yesterday = subDays(new Date(), 1);
                setCustomRange([{
                    startDate: yesterday,
                    endDate: yesterday,
                }]);
                break;
            case 'last_7_days':
                setCustomRange([{
                    startDate: subDays(new Date(), 7),
                    endDate: new Date(),
                }]);
                break;
            case 'last_30_days':
                setCustomRange([{
                    startDate: subDays(new Date(), 30),
                    endDate: new Date(),
                }]);
                break;
            case 'this_month':
                setCustomRange([{
                    startDate: startOfMonth(new Date()),
                    endDate: new Date(),
                }]);
                break;
            case 'last_month':
                const lastMonthStart = startOfMonth(subDays(new Date(), 30));
                const lastMonthEnd = endOfMonth(subDays(new Date(), 30));
                setCustomRange([{
                    startDate: lastMonthStart,
                    endDate: lastMonthEnd,
                }]);
                break;
            case 'custom_range':
                setCustomRange([{
                    startDate: startDate || new Date(),
                    endDate: endDate || new Date(),
                }]);
                break;
            default:
                console.error('Unknown filter type:', type);
        }
    };

    return (
        <DateFilterContext.Provider value={{ filterType, customRange, handleFilterChange, handleDateChange, applyCustomRange, showDatePicker }}>
            {children}
        </DateFilterContext.Provider>
    );
};

export const useDateFilter = () => {
    return useContext(DateFilterContext);
};