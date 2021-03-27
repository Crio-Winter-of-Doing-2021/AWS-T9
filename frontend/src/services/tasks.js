import axios from 'axios'

const baseUrl = 'https://66cbcd87bfd2.ngrok.io'

const getScheduled = async () => {
    const response = await axios.get(`${baseUrl}/retrieveAllTasks/SCHEDULED`)
    console.log(response)
    return response.data
}

const getCompleted = async () => {
    const response = await axios.get(`${baseUrl}/retrieveAllTasks/COMPLETED`)
    console.log(response)
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

const scheduleTask = async (taskData) => {
    console.log(taskData)
    const response = await axios.post(`${baseUrl}/schedule`, taskData)
    console.log(response)
    return response.data
}
export default { getCompleted, getCancelled, getFailed, getScheduled, scheduleTask }