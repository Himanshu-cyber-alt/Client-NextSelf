import axios from "axios";


const API = "https://server-nextself.onrender.com/api/auth";



export const googleLogin = async (idToken) => {


  const response = await axios.post(`${API}/google`, {
    idToken,
  });

  return response.data;
};


export const createTask = async (taskData) => {

  console.log(taskData)
  const token = localStorage.getItem("token");

  console.log(token);


  const response = await axios.post(`${API}/create`, taskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(response)

  return response.data;
};

export const getTasks = async (uuid) => {
  
  console.log("uuid " ,uuid)
  const response = await axios.get(
    `${API}/get/${uuid}`
  );

  console.log("test 1",response.data)

  return response.data;
};

export const checkFocusStatus = async (uuid) => {
  const response = await axios.get(`${API}/focus-status/${uuid}`);
  return response.data;
};

export const updateFocusStatus = async (uuid, status) => {
  const response = await axios.patch(`${API}/focus-status`, {
    uuid,
    status,
  });

  return response.data;
};

export const addDiamond = async (uuid, diamond) => {
  const result = await axios.post(`${API}/add-diamond`, {
    uuid,
    diamond,
  });

  return result.data;
};

export const getDiamond = async (uuid)=>{

 
const result = await axios.get(`${API}/get-diamond/${uuid}`);

  return result.data;

}

export const removeDiamond = async (uuid)=>{
 
  const result = await axios.post(`${API}/remove-diamond/${uuid}`);

  console.log("remove ", result)
   return result.data;
}


export const updateTaskStatus = async (taskId, status) => {
  const response = await axios.patch(`${API}/task-status`, {
    taskId,
    status,
  });

  return response.data;
};

export const addReward = async (uuid,minute)=>{
  const result = await axios.post(`${API}/add-reward`, {
    uuid,
    minute,
  });
  return result.data;
}


export const removeReward = async (uuid)=>{
  const result = await axios.post(`${API}/remove-reward`,{uuid});
  return result.data;

}


export const addHistory = async (uuid,title)=>{

  
  const result = await axios.post(`${API}/add-history`,{uuid,title})

  console.log("addhistory",result);

  return result.data;

}

export const getHistory = async (uuid) => {
  const result = await axios.get(`${API}/get-history/${uuid}`);
  return result.data;
};


export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("uuid");

  // If you store any other data
  localStorage.removeItem("user");
  localStorage.removeItem("email");

  // Optional: clear everything
  // localStorage.clear();
};


// Add this to the bottom of authService.js
export const sendEmailAlert = async (email) => {
  try {
    const response = await axios.post(`${API}/send-alert`, {
      email
    });


    console.log("Email ==> ",response);

    return response.data;
  } catch (error) {
    console.error("Email API failed:", error);
  }
};