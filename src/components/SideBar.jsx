import { Checkbox, FormControlLabel, Radio, RadioGroup, TextField, ToggleButton } from '@mui/material'
import { CheckIcon, CrossIcon, LockIcon, LockOpen } from 'lucide-react'
import React, { useState } from 'react'
import { IoAddCircle } from 'react-icons/io5'
import ToggleSwitch from './ToggleSwich'

const SideBar = () => {
    const [pickup,setPickup] = useState('')
    const [destination, setDestination] = useState('')
    const [isOn, setIsOn ] = useState(false)
  return (
    <section className='w-[25%] overflow-y-scroll-scroll'>

        <form>

            <div className='px-5 py-6'>
                <h3 className='text-sm mb-4'> Step 1 of 4 <b>Booking details</b></h3>

                <div className='mb-4'>
                    <TextField
                    label="Add pickup(required)"      // 👈 Floating label
                    variant="outlined"     // outlined | filled | standard
                    fullWidth
                    required
                    placeholder='Add your pickup location'
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    />
                </div>

                <div className='mb-4'>
                    <TextField
                    label="Add destination(required)"      // 👈 Floating label
                    variant="outlined"     // outlined | filled | standard
                    fullWidth
                    required
                    placeholder='Add your destination'
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    />
                </div>

                <div 
                className='flex gap-3 items-center align-center'>
                    <IoAddCircle size={20}/> 
                    <span className='inline-block'>Add Destination</span>
                </div>
            </div>

            <div className='flex gap-4 px-4 items-center justify-center'>
                
                <RadioGroup row defaultChecked="now">
                    <FormControlLabel
                    value="now"
                    control={
                        <Radio
                        sx={{
                            color: "green", // unchecked color
                            "&.Mui-checked": {
                            color: "green", // checked color
                            },
                            p: 1, // padding around the radio
                        }}
                        />
                    }
                    label="Book for now"
                    />
                

                
                    <FormControlLabel
                    value="later"
                    control={
                        <Radio
                        sx={{
                            color: "green", // unchecked color
                            "&.Mui-checked": {
                            color: "green", // checked color
                            },
                            p: 1, // padding around the radio
                        }}
                        />
                    }
                    label="Book for later"
                    />
                

                </RadioGroup>
                    
                

            </div>

            <div className='w-full bg-[#F8F6F2] px-4 py-5'>
                <div className='flex items-center w-full justify-between'>
                    <div className='flex gap-3 items-center'>
                    <LockIcon color='#145389'/>
                    <p className='text-xl text-[#145389] font-bold'>Fixed Price</p>
                    </div>

                    <ToggleSwitch enabled={isOn} onToggle={setIsOn}/>



                </div>

                <p className='mt-2'>
                    Lock in a price with no additional charges.
                </p>

                

            </div>            

        </form>

    </section>
  )
}

export default SideBar
