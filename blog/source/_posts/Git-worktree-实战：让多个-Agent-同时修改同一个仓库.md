---
title: Git worktree 实战：让多个 Agent 同时修改同一个仓库
date: 2026-03-16 10:00:00
tags:
  - Git
  - worktree
  - Agent
  - 开发效率
  - 工程实践
---

当我们开始让 AI Agent 参与开发时，一个很快会遇到的问题是：**多个 Agent 能不能同时改同一个仓库，而不是轮流抢一个工作目录？**

如果还是沿用传统做法，通常会遇到这些麻烦：

- 一个 Agent 切到新分支，另一个 Agent 又切走了
- 未提交改动互相污染，只能频繁 stash
- 同一个 `node_modules`、同一个工作目录被来回复用，状态越来越乱
- 想并行做多个任务时，只能复制多份仓库，既浪费磁盘，也不好同步

这类问题的一个非常实用的解法，就是 **Git worktree**。

<!-- more -->

## 一、Git worktree 是什么

简单说，`git worktree` 允许你基于**同一个 Git 仓库对象库**，挂出多个独立的工作目录。

你可以把它理解成：

- **一个仓库历史**
- **多个并行工作区**
- **每个工作区各自检出不同分支**
- **互不干扰，但共享 `.git` 数据**

和直接复制仓库相比，`git worktree` 有几个非常明显的优点：

1. **节省空间**：对象库共享，不需要把整个 `.git` 目录复制多份  
2. **切换成本低**：每个任务一个目录，不需要反复 `checkout`  
3. **适合并行**：人和 Agent 都可以在各自目录里独立工作  
4. **更不容易弄乱状态**：不需要频繁 stash、reset、切分支  

对于“让多个 Agent 同时修改同一个仓库”这个需求来说，`git worktree` 基本是最顺手的工程化方案之一。

## 二、为什么它特别适合 Agent 并行开发

多个 Agent 并行工作时，最核心的要求其实有三个：

### 1. 每个 Agent 都要有独立工作目录

Agent A 正在改文档，Agent B 正在修接口，Agent C 正在补测试。  
如果他们共用一个目录，就会出现：

- 分支互相覆盖
- 临时文件互相影响
- 构建产物混在一起
- Git 状态不可预测

`worktree` 正好把这个问题拆开：**一个 Agent 对应一个目录**。

### 2. 每个 Agent 都要绑定自己的分支

并行开发里最怕的不是“改得快”，而是“改到最后不知道谁改了什么”。  
每个 worktree 直接挂一个分支，天然就把任务边界明确了：

- `agent/docs-workflow`
- `agent/fix-login`
- `agent/add-tests`

这样后续 review、合并、回滚都会清晰很多。

### 3. 多个 Agent 仍然应该共享同一份仓库历史

如果给每个 Agent 都重新 `git clone` 一份仓库，虽然也能工作，但很快会遇到两个问题：

- 同步基础分支麻烦
- 仓库越大，复制成本越高

`git worktree` 保留了“多个目录独立”的好处，同时又共享同一个仓库对象库，非常适合这种多任务并行场景。

## 三、先理解一个关键限制

在真正开始之前，有一条规则一定要知道：

> **同一个分支不能同时被多个 worktree 检出。**

这其实是好事，因为它能避免两个工作目录同时在一个分支上写提交，导致历史混乱。

所以正确做法通常是：

- 主工作区保留 `master` 或 `main`
- 每个 Agent 使用一个**独立特性分支**
- 最后通过 merge / rebase / cherry-pick 把结果汇总

## 四、一个推荐的目录组织方式

假设你的主仓库在：

```bash
/workspace/project
```

我比较推荐把多个 worktree 放在主仓库外层的一个统一目录下，例如：

```bash
/workspace/project
/workspace/worktrees/agent-a
/workspace/worktrees/agent-b
/workspace/worktrees/agent-c
```

这样做有几个好处：

- 主仓库目录保持干净
- 多个 Agent 的工作区一眼能看清
- 删除某个 worktree 时不容易误删主仓库内容

## 五、最小可用示例：两个 Agent 同时修改一个仓库

下面用一个简单示例说明完整流程。

假设当前仓库默认分支是 `master`，你想让两个 Agent 并行做两件事：

- Agent A：补充 README 文档
- Agent B：新增一个简单脚本

### 第 1 步：准备主仓库

先保证主仓库是最新状态：

```bash
git checkout master
git pull origin master
```

### 第 2 步：创建两个 worktree

```bash
mkdir -p ../worktrees

git worktree add ../worktrees/agent-a -b agent/update-readme master
git worktree add ../worktrees/agent-b -b agent/add-demo-script master
```

这里的含义是：

- `../worktrees/agent-a`：Agent A 的工作目录
- `-b agent/update-readme`：为它创建并检出一个新分支
- `master`：这个新分支从 `master` 拉出来

同理，Agent B 也有自己的目录和自己的分支。

### 第 3 步：分别在两个目录里工作

Agent A 在自己的目录里改 README：

```bash
cd ../worktrees/agent-a
echo "## Agent A 更新的文档" >> README.md
git add README.md
git commit -m "docs: update README in agent worktree"
git push -u origin agent/update-readme
```

Agent B 在自己的目录里新增脚本：

```bash
cd ../worktrees/agent-b
mkdir -p scripts
cat > scripts/demo.sh <<'EOF'
#!/usr/bin/env bash
echo "hello from agent b"
EOF

chmod +x scripts/demo.sh
git add scripts/demo.sh
git commit -m "feat: add demo script in agent worktree"
git push -u origin agent/add-demo-script
```

到这里，两个 Agent 已经可以**同时推进自己的任务**，互不影响。

## 六、把它映射到真实的 Agent 协作流程

上面的例子比较简单，放到真实项目里，一般会演变成下面这种工作流。

### 方案：一个任务，一个分支，一个 worktree，一个 Agent

例如你要同时推进三个任务：

1. 修复登录接口超时
2. 给支付模块补测试
3. 更新部署文档

可以这样建：

```bash
git worktree add ../worktrees/agent-api -b agent/fix-login-timeout master
git worktree add ../worktrees/agent-test -b agent/add-payment-tests master
git worktree add ../worktrees/agent-docs -b agent/update-deploy-docs master
```

然后把不同 Agent 分别指向不同目录：

- Agent API 在 `../worktrees/agent-api`
- Agent Test 在 `../worktrees/agent-test`
- Agent Docs 在 `../worktrees/agent-docs`

每个 Agent 只需要遵守一条简单规则：

> **只在自己的 worktree 内修改、提交、推送。不要跨目录改别人的任务。**

这样带来的好处非常直接：

- 提交记录天然按任务隔离
- 构建和测试互不干扰
- 即使某个 Agent 把目录搞乱，也不会污染其他 Agent
- review 的时候能按分支逐个检查

## 七、一个更贴近实际的落地脚本

如果你经常需要给多个 Agent 开工作区，可以写一个简单脚本统一创建。

```bash
#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${1:-master}"
TASK_NAME="${2:?please provide task name}"
AGENT_NAME="${3:?please provide agent name}"

WORKTREE_ROOT="../worktrees"
BRANCH_NAME="agent/${TASK_NAME}"
WORKTREE_PATH="${WORKTREE_ROOT}/${AGENT_NAME}"

mkdir -p "${WORKTREE_ROOT}"
git fetch origin "${BASE_BRANCH}"
git worktree add "${WORKTREE_PATH}" -b "${BRANCH_NAME}" "origin/${BASE_BRANCH}"

echo "created:"
echo "  branch:   ${BRANCH_NAME}"
echo "  path:     ${WORKTREE_PATH}"
```

使用方式：

```bash
./create-agent-worktree.sh master fix-search-bug agent-search
./create-agent-worktree.sh master add-e2e-tests agent-e2e
./create-agent-worktree.sh master update-docs agent-docs
```

执行后，不同 Agent 就能直接进入各自目录开始工作。

## 八、如何查看和管理所有 worktree

### 查看当前所有 worktree

```bash
git worktree list
```

输出大致会像这样：

```bash
/workspace/project                  abcdef1 [master]
/workspace/worktrees/agent-a       1234567 [agent/update-readme]
/workspace/worktrees/agent-b       89abcde [agent/add-demo-script]
```

这条命令非常重要。  
当 Agent 数量变多时，你可以通过它快速确认：

- 哪些 worktree 还在
- 每个目录当前挂的是哪个分支
- 有没有遗留的旧任务目录

### 删除一个已经完成的 worktree

当某个任务合并完成后，可以清理对应工作区：

```bash
git worktree remove ../worktrees/agent-a
git branch -d agent/update-readme
```

如果对应分支已经推送到远端、并且确认本地不再需要，就可以删掉本地分支。

### 清理失效记录

有时 worktree 目录被手动删掉了，但 Git 记录还在，这时可以执行：

```bash
git worktree prune
```

## 九、实战中最常见的几个坑

### 坑 1：想让两个 Agent 共用同一个分支

这是最常见的误区。  
如果两个 Agent 都要改“登录功能”，也不要让它们同时挂在 `feature/login` 上。

更稳妥的做法是：

- `agent/login-ui`
- `agent/login-api`

最后再统一整合。

### 坑 2：把构建产物和缓存文件共享混了

虽然 Git 对象库是共享的，但每个 worktree 的工作目录是独立的。  
如果项目本身有大量缓存、构建目录、临时数据库文件，建议确保这些文件：

- 已加入 `.gitignore`
- 尽量只在各自目录内部生成
- 不要写到公共相对路径之外

否则多个 Agent 还是可能因为“目录外共享资源”互相影响。

### 坑 3：基础分支太旧

有些团队一口气拉了很多 worktree，但一直不更新基础分支。  
结果到最后合并时发现：

- 冲突特别多
- 每个 Agent 的上下文都过时了

比较好的习惯是：

1. 先更新主仓库基础分支  
2. 再创建新的 worktree  
3. 长任务定期 `fetch` 和 `rebase`

### 坑 4：任务结束后不清理

worktree 用久了之后，最容易积累“死目录”和“废分支”。  
建议建立固定的收尾动作：

1. 合并任务
2. 删除 worktree
3. 删除不再需要的本地分支
4. 定期执行 `git worktree list` 和 `git worktree prune`

## 十、一套我更推荐的团队实践

如果你准备在团队里长期使用 Agent 协作，我建议采用下面这套规则。

### 规则 1：主仓库只做集成，不直接做开发

主工作区保留在：

- `master`
- `main`
- 或者一个集成分支

不要让 Agent 直接在主工作区上干活。  
主工作区的职责更适合是：

- 更新基础分支
- 查看整体状态
- 汇总和整合多个任务结果

### 规则 2：分支命名带上 Agent 或任务语义

例如：

- `agent/fix-checkout-timeout`
- `agent/write-observability-docs`
- `agent/refactor-cache-layer`

这样一看分支名就知道是谁、为啥而建。

### 规则 3：一个 worktree 只承载一个明确目标

不要在一个 Agent 目录里一边修 bug，一边加功能，一边顺手改文档。  
worktree 越聚焦，最后 review、回滚、拆分提交就越轻松。

### 规则 4：每个 Agent 独立提交、独立推送

这是让并行开发真正可控的关键。

推荐节奏：

1. Agent 在自己的 worktree 中完成改动
2. 本地执行最小必要验证
3. 提交到自己的分支
4. 推送远端
5. 再进入 review 或汇总阶段

### 规则 5：用脚本而不是手工维护大量 worktree

当 worktree 数量超过 3 个以后，手工创建和清理就很容易出错。  
这时最好配套两个脚本：

- 一个负责创建
- 一个负责清理

工具化之后，整个流程会稳定很多。

## 十一、什么时候不适合用 worktree

虽然 `git worktree` 很好用，但也不是所有场景都必须上它。

以下场景未必需要：

- 你同时只处理一个任务
- 你几乎不需要并行分支开发
- 仓库非常小，重新 clone 成本可以忽略
- 你的开发环境严重依赖目录绝对路径，切换目录会触发大量额外配置

不过只要你已经进入下面这些场景，worktree 基本都会很值：

- 同时开多个需求或修复任务
- 想让多个 AI Agent 并行工作
- 需要避免 stash 地狱
- 不想维护多份重复仓库副本

## 十二、总结

如果要用一句话概括：

> **Git worktree 的价值，不只是“多开几个目录”，而是给并行开发建立清晰边界。**

在多 Agent 协作里，它尤其好用，因为它天然解决了几个核心问题：

- 每个 Agent 有自己的工作区
- 每个任务有自己的分支
- 所有人共享同一份仓库历史
- 不需要反复切分支和 stash
- 更容易提交、review、合并和清理

如果你正准备把 AI Agent 纳入日常开发流程，我非常建议先把 `git worktree` 用起来。  
先从两个 worktree 的小示例开始，等流程跑顺后，再逐步扩展到更多任务和更完整的自动化脚本。

很多时候，真正限制并行开发的不是 Agent 数量，而是**仓库工作流有没有为并行协作设计好边界**。  
而 `git worktree`，正是那个成本很低、收益很高的起点。
