from celery import Celery
import requests

app = Celery('task', broker = 'pyamqp://guest@localhost//')

@app.task
def sleep_asynchronously(url):
    return (requests.get(url).status_code)

# for url in ['http://xmeme-utkarsh.herokuapp.com/memes', 'https://jsonplaceholder.typicode.com/users']:
#     # sleep_asynchronously.(url)
#     sleep_asynchronously.apply_async(args= [url], countdown = 5)

@app.task
def taskExecuteTask(data):
    res = requests.request(method=data['requestData']['method'], 
        url=data['taskUrl'], 
        data=data['requestData']['body'], 
        headers=data['requestData']['headers'])
    # tasks_by_status.update_one({'_id': tasks_by_status_id}, {"$unset": {"RUNNING.{}".format(id): True}}, upsert=False)
    if res.ok:
        with open('success.txt','w') as f:
            f.write('s')
    else:
        with open('failure.txt','w') as f:
            f.write('s')

data = {
    "taskUrl": "http://127.0.0.1:5000/tp",
    "delay": 5,
    "requestData": {
        "method": "GET",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": None
    }
}

result = taskExecuteTask.apply_async(args=(data,), countdown= data['delay'])



