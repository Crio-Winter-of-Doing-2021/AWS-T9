import taskService from '../services/tasks'
import axios from 'axios'

const baseUrl = 'http://127.0.0.1:5000'

const Table = (props) => {
    console.log('In table',props.data);
    // let tasks = props.data.map(async(row, i) => {
    //     row = await taskService.getTaskData(row)
    //     return row
    // })
    // console.log(tasks);

    let cancelTask = (taskId) => {
        axios.put(`${baseUrl}/cancel/${taskId}`)
    }

    let modifyTask = (taskId) => {
        let delay = prompt('Enter new delay')
        if(delay == "") return
        axios.put(`${baseUrl}/modify/${taskId}`, { "delay" : Number(delay) })
    }


    return (
    <table className="table">
        <thead>
            <tr>
                <th scope="col">TaskId</th>
                <th scope="col">URL</th>
                <th scope="col">Timestamp</th>
                <th scope="col">Delay</th>
                <th scope="col">RequestData</th>
                <th scope="col">Status</th>
                <th scope="col"></th>
            </tr>
        </thead>
        <tbody>
            {props.data.sort((a,b) => new Date(b['timestamp']) - new Date(a['timestamp'])).map((row) => <tr>
                    <td>{row['_id']}</td>
                    <td>{row['taskUrl']}</td>
                    <td>{new Date(row['timestamp']).toString()}</td>
                    <td>{row['delay']}</td>
                    <td>{JSON.stringify(row['requestData'])}</td>
                    <td>{row['taskStatus']}</td>
                    <td>
                    {
                        (row['taskStatus'] == 'SCHEDULED' ? (
                            <>
                            <button className="btn btn-danger">
                                <i className="fa fa-trash" aria-hidden="true" onClick={() => cancelTask(row['_id'])}/>
                            </button>
                            <button className="btn btn-warning">
                                <i className="fa fa-pencil" aria-hidden="true" onClick={() => modifyTask(row['_id'])}/>
                            </button>
                            </>
                        ) : "")
                    }
                    </td>
                </tr>
            )}
        </tbody>
    </table>
    )
}

export default Table
