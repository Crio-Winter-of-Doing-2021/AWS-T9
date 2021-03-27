import axios from 'axios'

const baseUrl = 'http://127.0.0.1:5000'

const getTasksByStatus = async (status="") => {
    const response = await axios.get(`${baseUrl}/retrieveAllTasks/${status}`)
    console.log(response)
    return response.data
}

const getTaskData = async (id) => {
    const response = await axios.get(`${baseUrl}/retrieveTaskData/${id}`)
    console.log(response)
    return response.data
}


const getScheduled = async () => {
    const response = await axios.get(`${baseUrl}/retrieveAllTasks/SCHEDULED`)
    // console.log(response)
    return response.data
}

const getCompleted = async () => {
    const response = await axios.get(`${baseUrl}/retrieveAllTasks/COMPLETED`)
    // console.log(response)
    return response.data
}

const getCancelled = async () => {
    const response = await axios.get(`${baseUrl}/retrieveAllTasks/CANCELLED`)
    return response.data
}

const getFailed = async () => {
    const response = await axios.get(`${baseUrl}/retrieveAllTasks/FAILED`)
    return response.data
}

const getRunning = async () => {
    const response = await axios.get(`${baseUrl}/retrieveAllTasks/RUNNING`)
    return response.data
}

const scheduleTask = async (taskData) => {
    console.log(taskData)
    const response = await axios.post(`${baseUrl}/schedule`, taskData)
    // console.log(response)
    return response.data
}
export default { scheduleTask, getTasksByStatus, getTaskData }
