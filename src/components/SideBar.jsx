import { TextField } from '@mui/material'
import React, { useState } from 'react'

const SideBar = () => {
    const [pickup,setPickup] = useState('')
  return (
    <section className='w-[25%] bg-red-100 h-screen overflow-y-auto space-y-4'>

        <form className='px-5 py-6'>

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
                placeholder='Add your pickup location'
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                />
            </div>

            

            

        </form>

    </section>
  )
}

export default SideBar
