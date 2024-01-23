#!/bin/bash

# 设置GitHub API的基本URL
GITHUB_API_URL="https://api.github.com"

# 您的GitHub用户名和仓库名称
USERNAME="kailous"
REPO_NAME="Spline-cn"

# 您的GitHub Token，存储在GitHub Actions的Secrets中
GITHUB_TOKEN="$GIT_TOKEN"

# 提取新版本号，这个需要根据您的实际情况来获取
NEW_VERSION="v1.0.0"

# 提取已存在的发布ID
RELEASE_ID=$(curl -s -H "Authorization: token $GITHUB_TOKEN" $GITHUB_API_URL/repos/$USERNAME/$REPO_NAME/releases/tags/$NEW_VERSION | jq -r .id)

if [ -z "$RELEASE_ID" ]; then
  echo "Release does not exist. Creating a new release..."
  # 创建新的发布
  RESPONSE=$(curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" -d "{\"tag_name\":\"$NEW_VERSION\"}" $GITHUB_API_URL/repos/$USERNAME/$REPO_NAME/releases)

  # 提取新发布的ID
  RELEASE_ID=$(echo $RESPONSE | jq -r .id)
fi

# 删除旧的发布资产，这里假设要删除所有旧的资产
ASSETS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" $GITHUB_API_URL/repos/$USERNAME/$REPO_NAME/releases/$RELEASE_ID/assets | jq -r '.[] | .id')

for ASSET_ID in $ASSETS; do
  echo "Deleting asset with ID $ASSET_ID..."
  curl -s -X DELETE -H "Authorization: token $GITHUB_TOKEN" $GITHUB_API_URL/repos/$USERNAME/$REPO_NAME/releases/assets/$ASSET_ID
done

# 上传新的资产（例如新的压缩文件）
echo "Uploading new asset..."
curl -s -H "Authorization: token $GITHUB_TOKEN" -H "Content-Type: application/zip" --data-binary @./app.zip $GITHUB_API_URL/repos/$USERNAME/$REPO_NAME/releases/$RELEASE_ID/assets?name=app.zip
