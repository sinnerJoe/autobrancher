const cp = require('child_process');
const process = require("process")


const fetchRemoteBranches = () => cp.execSync("git fetch -p --all", {stdio: ['ignore', 'pipe', 'pipe']},).toString();

const createBranch = (branchName) => {
    return cp.execSync(`git checkout -b ${branchName}`).toString();
}

const deleteBranch = (branchName) => {
    return cp.execSync(`git branch -D ${branchName}`).toString();
}

const moveToBranch = (branchName) => {
    return cp.execSync(`git checkout ${branchName}`).toString();
}

const pullFrom = (branchName) => {
    return cp.execSync(`git pull origin ${branchName}`, {stdio:'pipe'}).toString();
}

const mergeWith = (branchName) => {
    return cp.execSync(`git merge ${branchName}`).toString();
}

const pushTo = (branchName) => {
    return cp.execSync(`git push origin ${branchName}`).toString()
}

const getBranchList = () => {
    const stdout = cp.execSync(`git branch`);
    const branchList = stdout.toString().split('\n').map(s => s.trim());
    return branchList
}

const getRemoteBranchList = () => {
    const stdout = cp.execSync(`git branch -r`);
    const branchList = stdout.toString().split('\n').map(s => s.trim());
    return branchList
}

const getCurrentBranch = () => {
    const branchList = getBranchList();
    for(const branch of branchList.map(b => b.trim())){
        if(branch[0] == '*')
            return branch.slice(2)
    }
}

const branchExistsLocaly = (soughtBranch) => {
    const branchList = getBranchList();
    for(const branch of branchList){
        if (branch.includes(soughtBranch)){
            return true;
        }
    }
    return false
}

const branchExistsRemotely = (soughtBranch) => {
    const branchList = getRemoteBranchList();
    for(const branch of branchList){
        if (branch.includes(soughtBranch)){
            return true;
        }
    }
    return false
}

const findMainBranch = () => {
    const toDevReg = /([\d\w-_]+?)_to_dev/;
    const toQaReg = /([\d\w-_]+?)_to_qa/;
    let mainBranch = getCurrentBranch()
    for (const reg of [toDevReg, toQaReg]) {
        if (mainBranch.match(reg)) {
            let mainBranch = mainBranch.replace(reg, "$1");
            break;
        }
    }
    return mainBranch
}


if (process.argv.length > 3) {
    throw "Too many arguments"
} 


let mainBranch = findMainBranch();

const toDevBranch = `${mainBranch}_to_dev`;
const toQaBranch = `${mainBranch}_to_qa`;

if (process.argv.length === 3) {
    switch (process.argv[2]) {
        case 'clean': 
            moveToBranch(mainBranch);
            for(const branch of [toDevBranch, toQaBranch]){
                try{
                    deleteBranch(branch);
                }catch(err){}
            }
            process.exit(0);
    }
} 

if(['master', 'qa', 'development'].includes(mainBranch)){
    console.log(`You can't create secondary branches from ${mainBranch}.`)
    console.log(`Please move to the branch of your task`)
    process.exit(1);
    return 1;
}

fetchRemoteBranches();

try{
        publishTemportaryBranch(toDevBranch, 'development'),
        publishTemportaryBranch(toQaBranch, 'qa')
}catch(err){

}



function publishTemportaryBranch(branch, pullTarget) {

    let stage = 0

    try {

        console.log(`mainBranch = ${mainBranch}`)
        moveToBranch(mainBranch)

        if (!branchExistsLocaly(branch)) {
            console.log(`Branch ${branch} created!`)
            createBranch(branch)
        }
        else {
            moveToBranch(branch)
        }

        stage = 1;
        if (branchExistsRemotely(branch)) pullFrom(branch);
        stage = 2
        pullFrom(pullTarget)
        stage = 3
        mergeWith(mainBranch)
        pushTo(branch)
        moveToBranch(mainBranch)
        deleteBranch(branch)
    } catch (err) {
        console.log("ERROR " + err.message);
        if (err.message.includes("Command failed: git pull origin")) {
            console.log(`Conflict on branch "${branch}" after pulling from "${pullTarget}"`)
            throw err
        }

        switch (stage) {
            case 1: console.log(`Conflict on pulling remote branch origin/${branch}`); throw err;
            case 2: console.log(`Conflict on pulling remote branch origin/${pullTarget} into ${branch}`); throw err;
            case 3: console.log(`Conflict on merge of ${mainBranch} into ${branch}`); throw err;
            default: console.log('OTHER ERROR: ' + err.message); break;
        }
    }
}