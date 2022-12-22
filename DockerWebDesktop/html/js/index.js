(function () {
	let REAL_IP = null;
	const resetOutput = () => {
		outputStatus.innerHTML = '?';
		outputMessage.innerHTML = '';
	};
	const formatOutput = (output) => {
		if (output) {
			while (output.indexOf('\n\n') >= 0) {
				output = output.trim().replaceAll('\n\n', '\n');
			}
			while (output.indexOf('  ') >= 0) {
				output = output.trim().replaceAll('  ', '&nbsp;&nbsp;');
			}
			return output.trim().replaceAll('\n', '<br />');
		}
		return '';
	};
	const showDefaultResponseStatus = (response) => {
		outputStatus.innerHTML = response.Status;
		outputMessage.innerHTML = formatOutput(response.Output);
		if (response.Status == 0) {
			outputMessage.classList.remove('error');
		} else {
			outputMessage.classList.add('error');
		}
		initGui(750);
	}
	const showDefaultExceptionStatus = (exc) => {
		outputStatus.innerHTML = '?';
		outputMessage.classList.add('error');
		outputMessage.innerHTML = formatOutput(exc.toString());
	};

	const getCommandFromButton = (button) => {
		return button.getAttribute('data-action');
	};
	const bt_Click_Open = (event) => {
		const button = event.target;
		const command = getCommandFromButton(button);
		window.open(command);
	};

	// dockerd
	const btDockerd_Click = (event) => {
		const button = event.target;
		if (button.classList.contains('pressed')) {
			dockerdStop(event);
		} else {
			dockerdStart(event);
		}
	};
	const dockerdStart = (event) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/docker-d', { command: 'start' }, dockerdStartSuccess, dockerdStartError);
	};
	const dockerdStartSuccess = (dockerdStartResponse) => {
		showDefaultResponseStatus(dockerdStartResponse);
		if (dockerdStartResponse.Status == 0) {
			btDockerd.classList.add('pressed');
		}
		showDockerAndSwarmDStatus(true, null);
	};
	const dockerdStartError = (exc) => { outputStatus.innerHTML = exc; };
	const dockerdStop = (event) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/docker-d', { command: 'stop' }, dockerdStopSuccess, dockerdStopError);
	};
	const dockerdStopSuccess = (dockerdStopResponse) => {
		showDefaultResponseStatus(dockerdStopResponse);
		if (dockerdStopResponse.Status == 0) {
			btDockerd.classList.remove('pressed');
		}
		showDockerAndSwarmDStatus(false, null);
	};
	const dockerdStopError = (exc) => { outputStatus.innerHTML = exc; };
	// /dockerd

	// swarm
	const btSwarm_Click = (event) => {
		const button = event.target;
		if (button.classList.contains('pressed')) {
			swarmLeave(event);
		} else {
			swarmInit(event);
		}
	};
	const swarmInit = (event) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/swarm', { command: 'init' }, swarmInitSuccess, swarmInitError);
	};
	const swarmInitSuccess = (swarmInitResponse) => {
		showDefaultResponseStatus(swarmInitResponse);
		if (swarmInitResponse.Status == 0) {
			btSwarm.classList.add('pressed');
		}
	};
	const swarmInitError = (exc) => { outputStatus.innerHTML = exc; };
	const swarmLeave = (event) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/swarm', { command: 'leave --force' }, swarmLeaveSuccess, swarmLeaveError);
	};
	const swarmLeaveSuccess = (swarmLeaveResponse) => {
		showDefaultResponseStatus(swarmLeaveResponse);
		if (swarmLeaveResponse.Status == 0) {
			btSwarm.classList.remove('pressed');
		}
	};
	const swarmLeaveError = (exc) => { outputStatus.innerHTML = exc; };
	// /swarm

	const showSettings = (apiSettingsResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' }, outputSettings);
		gridBuilder.build(
			apiSettingsResponse.Data.Settings,
			[
				{ name: 'Name' }, { name: 'Version' }, { name: 'Ports' }, { name: 'NetworkMode' }
			],
			[
				{ label: 'run', handler: settingRun, enabled: (setting) => setting.Ports },
				{ label: 'build Dockerfile', handler: buildDockerfile, enabled: (setting) => setting.Dockerfile },
				{ label: 'deploy docker-compose.yml', handler: deployDockerComposeYml, enabled: (setting) => setting.DockerComposeYml }
			],
			[
				{ label: 'test IP', handler: settingTest }, { label: 'test localhost', handler: settingTestLocalhost }
			]
		);
	};
	const settingTest = (event, setting) => {
		event.preventDefault();
		window.open(`//${REAL_IP}:${setting.Ports[0].split(':')[0]}`);
	};
	const settingTestLocalhost = (event, setting) => {
		event.preventDefault();
		window.open(`//localhost:${setting.Ports[0].split(':')[0]}`);
	};
	const showSettingsError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputSettings, exc);
	};

	const showImages = (apiImagesResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' }, outputImages);
		gridBuilder.build(
			apiImagesResponse.Data.Images,
			[
				{ name: 'Repository' }, { name: 'Tag' }, { name: 'ImageId' }, { name: 'Created' }, { name: 'Size' }
			],
			[
				{ label: 'run', handler: imageRun, enabled: (image) => image.Tag != '<none>' },
				{ label: 'remove by repository:tag', handler: imageRemove, enabled: (image) => image.Tag != '<none>' },
				{ label: 'remove by id', handler: imageRemoveById }
			],
			[
				{ label: 'history', href: imageHistoryHref, target: '_blank' },
				{ label: 'inspect', href: imageInspectHref, target: '_blank' }
			]
		);
	};
	const imageHistoryHref = (image) => {
		return '/api/image/history?imageId=' + image.ImageId;
	};
	const imageInspectHref = (image) => {
		return '/api/image/inspect?imageId=' + image.ImageId;
	};

	const showImagesError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputImages, exc);
	};

	const imageRun = (event, image) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/image/run', { repository: image.Repository, tag: image.Tag, imageId: image.ImageId }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const imageRemove = (event, image) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/image/remove', { repository: image.Repository, tag: image.Tag }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const imageRemoveById = (event, image) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/image/remove-by-id', { imageId: image.ImageId }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const settingRun = (event, setting) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/setting/run', { name: setting.Name, version: setting.Version }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const buildDockerfile = (event, image) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/build-dockerfile', { name: image.Name, version: image.Version }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const deployDockerComposeYml = (event, image) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/deploy-docker-compose-yml', { name: image.Name, version: image.Version }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const showStackServices = (services) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'small' });
		const grid = gridBuilder.build(
			services,
			[
				{ name: 'Id' },
				{ name: 'Name' },
				{ name: 'Mode' },
				{ name: "Replicas" },
				{ name: "Image" },
				{ name: "Ports" }
			]
		);
		return grid;
	};
	const showStackTasks = (tasks) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'small' });
		const grid = gridBuilder.build(
			tasks,
			[
				{ name: 'Id' },
				{ name: 'Name' },
				{ name: 'Image' },
				{ name: 'Node' },
				{ name: 'DesiredState' },
				{ name: 'CurrentState' },
				{ name: 'Error' },
				{ name: 'Ports' }
			]
		);
		return grid;
	};
	const showStacks = (apiStacksResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' }, outputStacks);
		gridBuilder.build(
			apiStacksResponse.Data.Stacks,
			[
				{ name: 'Name' },
				{ name: 'Services', formatter: showStackServices, class: 'parent' },
				{ name: 'Tasks', formatter: showStackTasks, class: 'parent' },
				{ name: 'Orchestrator' }
			],
			[
				{ label: 'remove', handler: stackRemove }
			]
		);
	};
	const showStacksError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputStacks, exc);
	};
	const stackRemove = (event, stack) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/stack/remove', { name: stack.Name }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const showInstances = (apiInstancesResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' }, outputInstances);
		gridBuilder.build(
			apiInstancesResponse.Data.Instances,
			[
				{ name: 'ContainerId' },
				{ name: 'Image' },
				{ name: 'Running', formatter: (value) => value ? 'YES' : 'NO' },
				{ name: "Command" },
				{ name: "Created" },
				{ name: "Status" },
				{ name: "Ports" },
				{ name: "Names" }
			],
			[
				{ label: 'start', handler: instanceStart, enabled: (instance) => !instance.Running },
				{ label: 'stop', handler: instanceStop, enabled: (instance) => instance.Running },
				{ label: 'remove', handler: instanceRemove, enabled: (instance) => !instance.Running },
				{ label: 'shell', handler: instanceSee, enabled: (instance) => instance.Running },
				{ label: 'stats', handler: instanceStatsSee },
				{ label: 'logs', handler: instanceLogsSee }
			],
			[
				{ label: 'inspect', href: instanceInspectHref, target: '_blank' },
				{ label: 'stats', href: instanceStatsHref, target: '_blank' },
				{ label: 'logs', href: instanceLogsHref, target: '_blank' }
			]
		);
	};
	const showInstancesError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputInstances, exc);
	};

	const instanceLogsHref = (instance) => { return '/api/instance/logs?containerId=' + instance.ContainerId; };
	const instanceInspectHref = (instance) => { return '/api/instance/inspect?containerId=' + instance.ContainerId; };
	const instanceStatsHref = (instance) => { return '/api/instance/stats?containerId=' + instance.ContainerId; };

	const instanceStart = (event, instance) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/instance/start', { containerId: instance.ContainerId }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const instanceStop = (event, instance) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/instance/stop', { containerId: instance.ContainerId }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};
	const instanceRemove = (event, instance) => {
		resetOutput();
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/instance/remove', { containerId: instance.ContainerId }, showDefaultResponseStatus, showDefaultExceptionStatus);
	};

	const instanceSee = (event, instance) => { window.location.href = "/api/instance/see?containerId=" + instance.ContainerId; };
	const instanceStatsSee = (event, instance) => { window.location.href = "/api/instance/stats-see?containerId=" + instance.ContainerId; };
	const instanceLogsSee = (event, instance) => { window.location.href = "/api/instance/logs-see?containerId=" + instance.ContainerId; };

	const loadSettings = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.post('/api/settings', null, showSettings, showSettingsError);
	};
	const loadImages = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.post('/api/images', null, showImages, showImagesError);
	};
	const loadInstances = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.post('/api/instances', null, showInstances, showInstancesError);
	};
	const loadStacks = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/stacks', null, showStacks, showStacksError);
	};
	const loadNetworks = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/networks', null, showNetworks, showNetworksError);
	};
	const loadDiskUsages = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/disk-usages', null, showDiskUsages, showDiskUsagesError);
	};
	const loadStatus = () => {
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/status', null, showStatus, showStatusError);
	};

	const showNetworks = (apiNetworksResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' }, outputNetworks);
		gridBuilder.build(
			apiNetworksResponse.Data.Networks,
			[
				{ name: 'NetworkId' },
				{ name: 'Name' },
				{ name: 'Driver' },
				{ name: 'Scope' }
			],
			[],
			[
				{ label: 'inspect', href: networkInspectHref, target: '_blank' }
			]
		);
	};
	const showNetworksError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputNetworks, exc);
	};
	const networkInspectHref = (network) => {
		return '/api/network/inspect?networkId=' + network.NetworkId;
	};

	const showDiskUsages = (apiDiskUsagesResponse) => {
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true }, outputDiskUsages);
		gridBuilder.build(
			apiDiskUsagesResponse.Data.DiskUsages,
			[
				{ name: 'Type' }, { name: 'Total' }, { name: 'Active' }, { name: 'Size' }, { name: 'Reclaimable' }
			]
		);
	};
	const showDiskUsagesError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputDiskUsages, exc);
	};

	const showDockerAndSwarmDStatus = (statusDockerD, statusSwarm) => {
		outputMessage.classList.remove('error');
		outputMessage.innerHTML = '';
		if (statusDockerD === true) {
			outputMessage.innerHTML += '<div>DockerD is running!</div>';
		} else if (statusDockerD === false) {
			outputMessage.innerHTML += '<div class="error">DockerD is NOT running!</div>';
		}
		if (statusSwarm === true) {
			outputMessage.innerHTML += '<div>Swarm is initiated!</div>';
		} else if (statusSwarm === false) {
			outputMessage.innerHTML += '<div class="error">Swarm is NOT initiated!<div>';
		}
	};

	const showStatus = (apiStatusResponse) => {
		const status = apiStatusResponse.Data.Status;
		REAL_IP = status.Ip;
		btDockerd.removeAttribute('disabled');
		if (status.DockerD) {
			btDockerd.classList.add('pressed');
			[outputImages, outputInstances, outputStacks, outputNetworks, outputDiskUsages].forEach((element) => element.classList.remove('disabled'));
		} else {
			btDockerd.classList.remove('pressed');
			[outputImages, outputInstances, outputStacks, outputNetworks, outputDiskUsages].forEach((element) => element.classList.add('disabled'));
		}
		if (status.Swarm) {
			btSwarm.classList.add('pressed');
		} else {
			btSwarm.classList.remove('pressed');
		}
		if (outputStatus.innerText == '?') {
			showDockerAndSwarmDStatus(status.DockerD, status.Swarm);
			outputStatus.innerHTML = 0;
		}
	};
	const showStatusError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const initGui = (delay) => {
		setTimeout(() => {
			loadSettings();
			loadImages();
			loadInstances();
			loadStacks();
			loadNetworks();
			loadDiskUsages();
			loadStatus();
		}, delay);
	};

	const initListeners = () => {
		const buttons = document.querySelectorAll('button[data-target=_blank]');
		buttons.forEach((button) => {
			button.setAttribute('title', getCommandFromButton(button));
			button.addEventListener('click', bt_Click_Open);
		});
		btDockerd.addEventListener('click', btDockerd_Click);
		btSwarm.addEventListener('click', btSwarm_Click);
	};
	const init = () => {
		// initGui(0);
		initGui(100);
		initListeners();
	};

	window.addEventListener('load', init);
})();
