import React, { useContext, useEffect, useState } from 'react'
import assets, { imagesDummyData } from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext';

const RightSidebar = () => {
  const {selectedUser, messages} = useContext(ChatContext);
  const {logout, onlineUsers} = useContext(AuthContext);
  
  const [msgImages,setMsgImages] = useState([]);

  //get all images from the messages and set them to state

  useEffect(()=>{
    setMsgImages(
      messages.filter(msg=>msg.image).map(msg=>msg.image)
    )
  },[messages])

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full flex flex-col h-full ${selectedUser ? "max-md:hidden":""}`}>
      <div className="overflow-y-auto flex-grow">
        <div className='p-5'>
          <div className='flex flex-col items-center gap-2 text-xs font-light'>

            <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-20 aspect-[1/1] rounded-full'/>
            <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
                {onlineUsers.includes(selectedUser._id) && <p className='w-2 h-2 rounded-full bg-green-500'></p>}
                {selectedUser.fullName}
                </h1>
                <p className='px-10 mx-auto'>{selectedUser.bio}</p>
          </div>

          <hr  className='border-[#ffffff50] my-4'/>
          <div className='px-5 text-xs'>
            <p>Media</p>
            <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
                {msgImages.map((url,index)=>(
                    <div key={index} onClick={()=> window.open(url)} className='cursor-pointer rounded'>
                        <img src={url} alt="" className="w-full h-24 object-cover rounded-md" />

                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <button onClick={()=> logout()} className="mt-auto mb-4 mx-4 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 rounded-full cursor-pointer">
      Logout
      </button>
    </div>
  )
}

export default RightSidebar
