import { Checkbox, FormControlLabel, Radio, RadioGroup, TextField, ToggleButton } from '@mui/material'
import { CheckIcon, CrossIcon, LockIcon, LockOpen } from 'lucide-react'
import React, { useState } from 'react'
import { IoAddCircle } from 'react-icons/io5'
import ToggleSwitch from './ToggleSwich'
import CarDropdown from './CarDropdown'

const SideBar = () => {
    const [pickup,setPickup] = useState('')
    const [destination, setDestination] = useState('')
    const [passenger, setPassenger] = useState('')
    const [contact, setContact] = useState('')
    const [instruction, setInstruction] = useState('')
    const [isOn, setIsOn ] = useState(false)
    const [selected, setSelected] = useState(null)
  return (
    <section className='w-[25%] h-[83.4vh] overflow-y-scroll'>

        <form>

            {/* Step 1 */}

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

            <CarDropdown
            selectedOption={selected}
            onOptionSelect={setSelected}        
            /> 

            {/* Step 2  */}
            <div className='px-5 py-6'>

                <h3 className='text-sm mt-4 mb-4'> Step 2 of 4 <b>Contact details</b></h3>

                <div className='mb-4'>
                    <TextField
                    label="Passenger Name"      // 👈 Floating label
                    variant="outlined"     // outlined | filled | standard
                    fullWidth
                    required
                    placeholder='Passenger name'
                    value={passenger}
                    onChange={(e) => setPassenger(e.target.value)}
                    />

                </div>

                <div className='flex items-center justify-center gap-2 w-full'>
                    <div className='w-[20%] border rounded-sm h-14 flex items-center justify-center gap-1 '>
                        <img className="h-5" src="https://flagsapi.com/AU/flat/64.png"></img>
                        +61
                    </div>
                    <div className='flex-grow'>
                        <TextField
                        label="Contact Number"      // 👈 Floating label
                        variant="outlined"     // outlined | filled | standard
                        fullWidth
                        required
                        type='tel'
                        inputProps={{
                            pattern: "[0-9]{10}",
                            maxLength: 10,
                        }}        
                        value={contact}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setContact(value)
                        }}
                        />

                    </div>
                </div>

            </div>  

            {/* Step 3 */}

            <div className='px-5 py-6'>

                <h3 className='text-sm mt-2 mb-4'> Step 3 of 4 <b>Payment</b></h3>


            </div>

            {/* Step 4 */}

            <div className='px-5 py-6'>

                <h3 className='text-sm mt-2 mb-4'> Step 4 of 4 <b>Driver Instruction</b></h3>

                <div className='mb-4'>
                    <TextField
                        label="Notes for driver"      // 👈 Floating label
                        variant="outlined"     // outlined | filled | standard
                        fullWidth
                        multiline
                        rows={3}
                        inputProps={{
                            maxLength: 350,
                        }}        
                        value={instruction}
                        onChange={(e) => {
                            const value = e.target.value;
                            setInstruction(value)
                        }}
                        placeholder='e.g. Unit, Gate and floor numbers'
                    />
                </div>




            </div>




        </form>

    </section>
  )
}

export default SideBar
