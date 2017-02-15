API 文档

# 功能: get
url: "http://localhost:3000"
method: GET

# 功能: update 修改单个todo属性 completed/title
url: "http://localhost:3000"
method: POST
data: JSON.stringify({
    "newObj": {
        "oldId": oldId,
        "completed": completed,
        "title": title
    }
})

# 功能: toggleAll 修改所有comopleted元素都改为 true/false
url: "http://localhost:3000"
method: POST
data: JSON.stringify({
    "sign": true/false
})

# 功能: create 新增todo
url: "http://localhost:3000"
method: PUT
data: JSON.stringify({
    "newObj": {
        "id": id,
        "completed": completed,
        "title": title
    }
})

# 功能: delete 删除一条
url: "http://localhost:3000"
method: DELETE
data: oldId

# 功能: delete 删除所有已完成
url: "http://localhost:3000"
method: DELETE
data: "all"

