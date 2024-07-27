from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
import threading
import ContentBased as cb
import uvicorn
import pickle
import NeighborhoodBased as nb
import UpdateModelEs as up
import Environments as env
import os
import shutil
import schedule
import pyodbc
import time
import pandas as pd
# import predict_coment_real as cmt
import Cb_Store as cbs

app = FastAPI()

# run App: uvicorn main:app --reload
# host: http://127.0.0.1:8000/docs
# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with the appropriate origins if needed
    allow_methods=["*"],  # Or specify the allowed HTTP methods
    allow_headers=["*"],  # Or specify the allowed headers
)

def daily_job():
    print("training daily")
    with pyodbc.connect(env.CONN_STR) as conn:
        cursor = conn.cursor()
        cursor.execute(f"insert TRAIN_LOG (algorithm, phase, phasename, AD_DATE) values(4, 1, N'update du lieu hang ngay', SYSDATETIME())")
        cursor.execute("EXEC [dbo].[RecommendDaily]")
        conn.commit()

schedule.every().day.at("00:00").do(daily_job)

def daily():
    while True:
        schedule.run_pending()
        time.sleep(1)

backup_folder = "./backup/"
training_thread = None
cbf_thread = None
daily_thread = None
cmt_thread = None

def backup_files(files):
    os.makedirs(backup_folder, exist_ok=True)
    for file in files:
        file_path = f'./artifacts/{file}' 
        shutil.copy(file_path, os.path.join(backup_folder, os.path.basename(file)))

def restore_files(files):
    for file in files:
        shutil.copy(os.path.join(backup_folder, os.path.basename(file)), file)


def trainNBCF():
    global env, training_thread
    files_to_backup = ["Knn_List_Seller.pkl", "final_predictions.pkl", "Knn_List_User.pkl"]
    env.training_error = 0
    env.training_end = 0
    env.training_phase = 0
    env.training_cancel = 0
    env.training_status = 0
    try:
        env.training_start = 1
        if env.training_cancel == 1:
            raise
        nb.train()
        env.training_status = 100
        training_thread = None
        env.training_end = 1
        env.training_start = 0
        env.training_phase = 4
        with pyodbc.connect(env.CONN_STR) as conn:
            cursor = conn.cursor()
            cursor.execute(f"insert TRAIN_LOG (algorithm, phase, phasename, AD_DATE) values(1, 4, N'kết thúc huấn luyện', SYSDATETIME())")
            cursor.commit()
    except Exception as e:
        print("rollback")
        env.training_cancel = 1
        env.training_error = 1
        env.training_end = 1
        env.training_start = 0
        training_thread = None
        env.training_start = 0
        with pyodbc.connect(env.CONN_STR) as conn:
            cursor = conn.cursor()
            cursor.execute(f"insert TRAIN_LOG (algorithm, phase, phasename, AD_DATE) values(1, -1, N'{e}', SYSDATETIME())")
            cursor.commit()
        restore_files(files_to_backup) 
        return

@app.post("/api/get/status/nbcf")
async def get_status_nbcf():
    global env
    return {
        "phase": env.training_phase,
        "status": env.training_status,
        "error": env.training_error,
        "end": env.training_end,
        "cancel": env.training_cancel
    }

@app.post("/api/trainingNBCF")
async def training_nbcf(background_tasks: BackgroundTasks):
    global env
    if (env.training_start == 0):
        training_thread = threading.Thread(target=trainNBCF)
        training_thread.start()
        return {"message": "start training"}
    else :
        return {"message": "dang training"}
# @app.get("/ws/offline")
# async def train_data_offline(websocket: WebSocket):
#     env.training_cancel = 0
#     await websocket.accept()
#     files_to_backup = ["Knn_List_Seller.pkl", "final_predictions.pkl", "Knn_List_User.pkl"]
#     backup_files(files_to_backup)
#     try:
#         if env.training_cancel == 1:
#             raise
#         # status 0: cancel, 1: running, 2: completed
#         await websocket.send_json({
#             "status": 1,
#             "phase": 1,
#             "process": 0.0
#         })        
#         await Knn_train(websocket)
#         await websocket.send_json({
#             "status": 2,
#             "phase": 2,
#             "process": 0.0
#         })   
#         await websocket.close()
#     except WebSocketDisconnect:
#         restore_files(files_to_backup) 
#         return HTTPException(status_code=404, detail="Training Fail")
#     except Exception as e:
#         print("rollback")
#         restore_files(files_to_backup) 
#         await websocket.send_json({
#             "status": 0,
#             "phase": 2,
#             "process": 0.0,
#             "Error": f"{e}"
#         }) 
#         env.training_cancel = 0
#         await websocket.close()

movies = {}
similarites = {}

def load_cb():
    global movies, similarites, env
    cate = env.CONTENT_BASED_CLUSTER
    for i in cate:
        movies[i] = pickle.load(open(f'artifacts/movie_list_cate_{i}.pkl','rb'))
        similarites[i] = pickle.load(open(f'artifacts/similarity_cate_{i}.pkl','rb'))

def train_model_cbf():
    global env, cbf_thread
    files_to_backup = [ "movie_list_cate_1103.pkl", 
                        "movie_list_cate_1104.pkl", 
                        "movie_list_cate_1105.pkl", 
                        "movie_list_cate_1106.pkl", 
                        "movie_list_cate_1107.pkl",
                        "movie_list_cate_1108.pkl", 
                        "movie_list_cate_1109.pkl", 
                        "movie_list_cate_1110.pkl", 
                        "movie_list_cate_1111.pkl", 
                        "movie_list_cate_1112.pkl", 
                        "movie_list_cate_1113.pkl", 
                        "movie_list_cate_1114.pkl", 
                        "movie_list_cate_1115.pkl", 
                        "movie_list_cate_1116.pkl", 
                        "movie_list_cate_1117.pkl", 
                        "movie_list_cate_1118.pkl", 
                        "movie_list_cate_1119.pkl", 
                        "movie_list_cate_1120.pkl", 
                        "movie_list_cate_1121.pkl", 
                        "movie_list_cate_1122.pkl", 
                        "movie_list_cate_1123.pkl", 
                        "movie_list_cate_1124.pkl", 
                        "movie_list_cate_1125.pkl", 
                        "movie_list_cate_1126.pkl", 
                        "movie_list_cate_1127.pkl", 
                        "similarity_cate_1103.pkl", 
                        "similarity_cate_1104.pkl", 
                        "similarity_cate_1105.pkl", 
                        "similarity_cate_1106.pkl", 
                        "similarity_cate_1107.pkl",
                        "similarity_cate_1108.pkl", 
                        "similarity_cate_1109.pkl", 
                        "similarity_cate_1110.pkl", 
                        "similarity_cate_1111.pkl", 
                        "similarity_cate_1112.pkl", 
                        "similarity_cate_1113.pkl", 
                        "similarity_cate_1114.pkl", 
                        "similarity_cate_1115.pkl", 
                        "similarity_cate_1116.pkl", 
                        "similarity_cate_1117.pkl", 
                        "similarity_cate_1118.pkl", 
                        "similarity_cate_1119.pkl", 
                        "similarity_cate_1120.pkl", 
                        "similarity_cate_1121.pkl", 
                        "similarity_cate_1122.pkl", 
                        "similarity_cate_1123.pkl", 
                        "similarity_cate_1124.pkl", 
                        "similarity_cate_1125.pkl", 
                        "similarity_cate_1126.pkl", 
                        "similarity_cate_1127.pkl"]
    backup_files(files_to_backup)
    env.cbf_error = 0
    env.cbf_end = 0
    env.cbf_phase = 1
    env.cbf_cancel = 0
    env.cbf_status = 0
    with pyodbc.connect(env.CONN_STR) as conn:
        cursor = conn.cursor()
        # cursor.execute("delete from TRAIN_LOG where TRAIN_LOG.algorithm = 2")
        cursor.execute(f"insert TRAIN_LOG (algorithm, phase, phasename, AD_DATE) values(2, 1, N'bắt đầu training CBF', SYSDATETIME())")
        cursor.commit()
    try:
        cate = env.CONTENT_BASED_CLUSTER
        env.cbf_start = 1
        if env.cbf_cancel == 1:
            raise
        for i in cate:
            if env.cbf_cancel == 1:
                raise
            cb.fetch_products_by_cate(i)
            cb.training(i)
            env.cbf_status = int((cate.index(i) + 1) / len(cate) * 100)
        env.cbf_status = 100
        cbf_thread = None
        env.cbf_end = 1
        env.cbf_start = 0
        env.cbf_phase = 2
    except Exception as e:
        print("rollback")
        env.cbf_cancel = 1
        env.cbf_error = 1
        env.cbf_end = 1
        env.cbf_status = 0
        cbf_thread = None
        env.cbf_start = 0
        with pyodbc.connect(env.CONN_STR) as conn:
            cursor = conn.cursor()
            cursor.execute(f"insert TRAIN_LOG (algorithm, phase, phasename, AD_DATE) values(2, -1, N'Chuẩn bị dữ liệu', SYSDATETIME())")
            cursor.commit()
        restore_files(files_to_backup) 
        return

@app.get("/api/trainingCBF")
async def train_CBF(background_tasks: BackgroundTasks):
    if(env.cbf_start == 0):
        cbf_thread = threading.Thread(target=train_model_cbf)
        cbf_thread.start()
        return {"message": "start training"}
    return {"message": "dang training"}

# @app.websocket("/ws/TraingProduct")
# async def TraingProduct(websocket: WebSocket):
#     await websocket.accept()

#     try: 
#         await websocket.send_text(f"Bắt đầu training product")
#         for i in cate:
#             print(i)
#             await websocket.send_text(f"{cate.index(i) / len(cate) * 100}%")
#             cb.fetch_products_by_cate(i)
#             cb.training(i)
#         await websocket.send_text(f"Kết thúc training")
#         await websocket.close()
#         load_cb()
#     except WebSocketDisconnect:
#         print(1)
@app.get("/get/RecommendProduct")
async def RecommendProduct(userid: int, productId: int, cateid: int):
    global env, similarites, movies
    cate = env.CONTENT_BASED_CLUSTER
    movie = []
    similarity = []
    if(cateid in cate):
        movie = movies[cateid]
        similarity = similarites[cateid]

    result = []
    if len(movie) > 0 and len(similarity > 0):
        result = await cb.recommend(productId, movie, similarity)
        result = [int(x) for x in result]
    print(result)
    if userid != 0:
        cb.write_recommend(userid, cateid, result)
    
    return {
        "total": len(result),
        "products": result
    }

@app.get("/get/RecommendProductForUser")
async def RecommendProductForUser(userid: int):
    user_log = cb.get_recommend_for_user(userid)
    print(user_log)
    return {
        "total": len(user_log),
        "products": user_log
    }


@app.get("/get/nbcf/cancel")
async def NBCF_cancel():
    env.training_cancel = 1
    return {
        "cancel": env.training_cancel 
    }

@app.get("/get/cbf/cancel")
async def CBF_cancel():
    env.cbf_cancel = 1
    return {
        "cancel": env.cbf_cancel 
    }

@app.post("/api/get/status/cbf")
async def get_status_cbf():
    global env
    return {
        "phase": env.cbf_phase,
        "status": env.cbf_status,
        "error": env.cbf_error,
        "end": env.cbf_end,
        "cancel": env.cbf_cancel
    }

final_predictions = pd.DataFrame()
def load_nb():
    global final_predictions
    final_predictions = pickle.load(open(f'artifacts/final_predictions.pkl','rb'))

@app.get('/nbcf/recommend')
async def nbcf_recommend(userid: int):
    global final_predictions
    print(final_predictions.shape)
    if userid not in final_predictions.index:
        return []
    result = nb.recommend(userid, final_predictions)
    return result

@app.post("/api/dailyjob/start")
async def daily_job_start():
    global daily_thread
    if daily_thread is None:
        daily_thread = threading.Thread(target=daily)
        daily_thread.start()
        return {"message": "Start daily job"}
    return {"message": "daily job is running"}

@app.post("/api/testmode")
def testmode():
    global final_predictions, movies
    if final_predictions is None:
        return {"nbcf": 0,
            "CBF": len(movies[1103])}
    return {"nbcf": len(final_predictions),
            "CBF": len(movies[1103])}


@app.get("/get/cmt/cancel")
async def CBF_cancel():
    env.cmt_cancel = 1
    return {
        "cancel": env.cbf_cancel 
    }

@app.post("/api/get/status/cmt")
async def get_status_cbf():
    global env
    return {
        "phase": env.CMT_phase,
        "status": env.CMT_status,
        "error": env.CMT_error,
        "end": env.CMT_end,
    }

def train_cmt():
    global env, cmt_thread
    env.CMT_error = 0
    env.CMT_end = 0
    env.CMT_phase = 1
    env.CMT_cancel = 0
    env.CMT_status = 0
    try:
        env.CMT_start = 1
        print("start")
        if env.CMT_cancel == 1:
            raise
        # cmt.main()
        env.CMT_status = 100
        cmt_thread = None
        env.CMT_end = 1
        print("đánh giá cmt xong")
        env.CMT_start = 0
        env.CMT_phase = 4
    except Exception as e:
        print("rollback")
        env.CMT_cancel = 1
        env.CMT_error = e
        env.CMT_end = 1
        env.CMT_start = 0
        env.CMT_phase = 0
        cmt_thread = None
        env.CMT_start = 0
        return

@app.get("/api/trainingCMT")
async def train_CBF(background_tasks: BackgroundTasks):
    global cmt_thread
    if(env.cbf_start == 0):
        cmt_thread = threading.Thread(target=train_cmt)
        cmt_thread.start()
        return {"message": "start training"}
    return {"message": "dang training"}

@app.get('/api/train/log')
async def  get_log_train(algorithm: int):
    response = []
    with pyodbc.connect(env.CONN_STR) as conn:
        cursor = conn.cursor()
        cursor.execute(f"select top(1) id, phase, phasename, AD_DATE from TRAIN_LOG where TRAIN_LOG.algorithm = {algorithm} ORDER BY AD_DATE DESC")
        result = cursor.fetchall()
        for i in result:
            d = dict()
            d['phase'] = i[1]
            d['message'] = i[2]
            d['ad_date'] = i[3]
            response.append(d)
    return response

store = pd.DataFrame()
store_similarity = []
def load_cb_store():
    global store, store_similarity
    store = pickle.load(open(f'artifacts/cb_store.pkl','rb'))
    store_similarity = pickle.load(open(f'artifacts/cb_store_similarity.pkl','rb'))

@app.get("/api/CBF-S/recommend")
async def CBFS_recommend(userid: int, storeid: int):
    global store, store_similarity, final_predictions
    try:
        store_simi = cbs.recommend(storeid, store, store_similarity)
        print(store_simi)
        if(userid == 0):
            result = store_simi[:10]
            result = [int(element) for element in result]
            return {"total": len(result),
                    "stores": result}
        else:
            if (userid in final_predictions.index):
                print(1)
                arr2_dict = pd.Series(final_predictions.loc[userid])
                print(arr2_dict)
                sorted_arr1 = sorted(store_simi, key=lambda x: arr2_dict.get(x, float('inf')))
                print(sorted_arr1)
                print("===============================================")
                result = sorted_arr1[:10]
                result = [int(element) for element in result]
                print(len(result))
                return {"total": len(result),
                        "stores": result}
            else:
                print(3)
                result = store_simi[:10]
                result = [int(element) for element in result]

                return {"total": len(result),
                        "stores": result}
    except Exception as e:
        print(e)
        return {"total": 0,
                "stores": [{}]}


@app.get("/api/NBCF/InfoMatrix")
async def CBFS_recommend(userid: int, storeid: int):
    global final_predictions
    try:
        seller = len(final_predictions.columns)
        user = len(final_predictions.columns)

        up_date = 0
        with pyodbc.connect(env.CONN_STR) as conn:
            cursor = conn.cursor()
            cursor.execute(f"select top(1) AD_DATE from TRAIN_LOG where TRAIN_LOG.algorithm = 1 ORDER BY AD_DATE DESC")
            result = cursor.fetchone()
            up_date = i[0]

        return {"seller": seller,
                "user": user,
                "up_date": up_date

        }
    except Exception as e:
        print(e)


@app.on_event("startup")
async def load_files():
    load_cb()
    load_nb()
    load_cb_store()
    global daily_thread
    daily_thread = threading.Thread(target=daily)
    daily_thread.start()

if __name__ == '__main__':
    uvicorn.run(app, port=env.FASTAPI_HOST, host=env.FASTAPI_HOST)
