if ($null -ne (git status --short)) {
    "git ist not clean, please commit first"
    exit
}

$COMMIT_SHA = git rev-parse HEAD
$COMMIT_SHA_SHORT = git rev-parse --short HEAD

docker build --build-arg COMMIT_SHA=$COMMIT_SHA -t jensforstmann/tmt2:$COMMIT_SHA_SHORT -t jensforstmann/tmt2:latest . `
&& docker push jensforstmann/tmt2:$COMMIT_SHA_SHORT `
&& docker push jensforstmann/tmt2:latest
