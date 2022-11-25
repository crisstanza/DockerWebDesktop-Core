(function () {
	let REAL_IP = null;
	const getCommandFromButton = (button) => {
		return button.getAttribute('data-action');
	};
	const bt_Click_Open = (event) => {
		const button = event.target;
		const command = getCommandFromButton(button);
		window.open(command);
	};
	const btDockerd_Click = (event) => {
		const button = event.target;
		if (button.classList.contains('pressed')) {
			dockerdStop(event);
		} else {
			dockerdStart(event);
		}
	};
	const dockerdStart = (event) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/docker-d', { command: 'start' }, dockerdStartSuccess, dockerdStartError);
	};
	const dockerdStartSuccess = (dockerdStartResponse) => {
		outputStatus.innerHTML = dockerdStartResponse.Status;
		if (dockerdStartResponse.Status == 0) {
			btDockerd.classList.add('pressed');
			initGui(500);
		}
	};
	const dockerdStartError = (exc) => { outputStatus.innerHTML = exc; };

	const dockerdStop = (event) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/docker-d', { command: 'stop' }, dockerdStopSuccess, dockerdStopError);
	};
	const dockerdStopSuccess = (dockerdStopResponse) => {
		outputStatus.innerHTML = dockerdStopResponse.Status;
		if (dockerdStopResponse.Status == 0) {
			btDockerd.classList.remove('pressed');
			initGui(500);
		}
	};
	const dockerdStopError = (exc) => { outputStatus.innerHTML = exc; };

	const showSettings = (apiSettingsResponse) => {
		const settings = apiSettingsResponse.Data.Settings;
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' });
		const grid = gridBuilder.build(
			settings,
			[
				{ name: 'Name' },
				{ name: 'Version' },
				{ name: 'Ports' },
				{ name: 'NetworkMode' }
			],
			[
				{ label: 'run', handler: settingRun, enabled: (setting) => setting.Ports },
				{ label: 'build Dockerfile', handler: buildDockerfile, enabled: (setting) => setting.Dockerfile },
				{ label: 'deploy docker-compose.yml', handler: deployDockerComposeYml, enabled: (setting) => setting.DockerComposeYml }
			],
			[
				{ label: 'test', handler: settingTest }
			]
		);
		if (outputSettings.querySelector('table'))
			outputSettings.querySelector('table').remove();
		outputSettings.appendChild(grid);
	};
	const settingTest = (event, setting) => {
		event.preventDefault();
		window.open(`//${REAL_IP}:${setting.Ports[0].split(':')[0]}`);
	};
	const showSettingsError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputSettings, exc);
	};

	const showImages = (apiImagesResponse) => {
		const images = apiImagesResponse.Data.Images;
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' });
		const grid = gridBuilder.build(
			images,
			[
				{ name: 'Repository' },
				{ name: 'Tag' },
				{ name: 'ImageId' },
				{ name: 'Created' },
				{ name: 'Size' }
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
		if (outputImages.querySelector('table'))
			outputImages.querySelector('table').remove();
		outputImages.appendChild(grid);
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
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/image/run', { repository: image.Repository, tag: image.Tag, imageId: image.ImageId }, imageRunSuccess, imageRunError);
	};
	const imageRunSuccess = (apiImageRunResponse) => {
		outputStatus.innerHTML = apiImageRunResponse.Status;
		loadInstances();
	};
	const imageRunError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const imageRemove = (event, image) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/image/remove', { repository: image.Repository, tag: image.Tag }, imageRemoveSuccess, imageRemoveError);
	};
	const imageRemoveById = (event, image) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/image/remove-by-id', { imageId: image.ImageId }, imageRemoveSuccess, imageRemoveError);
	};
	const imageRemoveSuccess = (apiImageRemoveResponse) => {
		outputStatus.innerHTML = apiImageRemoveResponse.Status;
		loadImages();
	};
	const imageRemoveError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const settingRun = (event, setting) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/setting/run', { name: setting.Name, version: setting.Version }, settingRunSuccess, settingRunError);
	};
	const settingRunSuccess = (apiSettingRunResponse) => {
		outputStatus.innerHTML = apiSettingRunResponse.Status;
		initGui(500);
	};
	const settingRunError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const buildDockerfile = (event, image) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/build-dockerfile', { name: image.Name, version: image.Version }, buildDockerfileSuccess, buildDockerfileError);
	};
	const buildDockerfileSuccess = (apiBuildDockerfileResponse) => {
		outputStatus.innerHTML = apiBuildDockerfileResponse.Status;
		loadImages();
		loadInstances();
	};
	const buildDockerfileError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const deployDockerComposeYml = (event, image) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/deploy-docker-compose-yml', { name: image.Name, version: image.Version }, deployDockerComposeYmlSuccess, deployDockerComposeYmlError);
	};
	const deployDockerComposeYmlSuccess = (apiDeployDockerComposeYmlResponse) => {
		outputStatus.innerHTML = apiDeployDockerComposeYmlResponse.Status;
		initGui(500);
	};
	const deployDockerComposeYmlError = (exc) => {
		outputStatus.innerHTML = exc;
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
		const stacks = apiStacksResponse.Data.Stacks;
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' });
		const grid = gridBuilder.build(
			stacks,
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
		if (outputStacks.querySelector('table'))
			outputStacks.querySelector('table').remove();
		outputStacks.appendChild(grid);
	};
	const showStacksError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputStacks, exc);
	};
	const stackRemove = (event, stack) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/stack/remove', { name: stack.Name }, stackRemoveSuccess, stackRemoveError);
	};
	const stackRemoveSuccess = (apiStackRemoveResponse) => {
		outputStatus.innerHTML = apiStackRemoveResponse.Status;
		loadInstances();
		loadStacks();
	};
	const stackRemoveError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const showInstances = (apiInstancesResponse) => {
		const instances = apiInstancesResponse.Data.Instances;
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' });
		const grid = gridBuilder.build(
			instances,
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
				{ label: 'stats', handler: instanceStatsSee }
			],
			[
				{ label: 'stats', href: instanceStatsHref, target: '_blank' },
				{ label: 'inspect', href: instanceInspectHref, target: '_blank' }
			]
		);
		if (outputInstances.querySelector('table'))
			outputInstances.querySelector('table').remove();
		outputInstances.appendChild(grid);
	};
	const showInstancesError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputInstances, exc);
	};

	const instanceInspectHref = (instance) => {
		return '/api/instance/inspect?containerId=' + instance.ContainerId;
	};
	const instanceStatsHref = (instance) => {
		return '/api/instance/stats?containerId=' + instance.ContainerId;
	};

	const instanceStart = (event, instance) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/instance/start', { containerId: instance.ContainerId }, instanceStartSuccess, instanceStartError);
	};
	const instanceStartSuccess = (apiInstanceStartResponse) => {
		outputStatus.innerHTML = apiInstanceStartResponse.Status;
		loadInstances();
	};
	const instanceStartError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const instanceStop = (event, instance) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/instance/stop', { containerId: instance.ContainerId }, instanceStopSuccess, instanceStopError);
	};
	const instanceStopSuccess = (apiInstanceStopResponse) => {
		outputStatus.innerHTML = apiInstanceStopResponse.Status;
		loadInstances();
	};
	const instanceStopError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const instanceRemove = (event, instance) => {
		outputStatus.innerHTML = '?';
		const fetcher = new io.github.crisstanza.Fetcher();
		fetcher.get('/api/instance/remove', { containerId: instance.ContainerId }, instanceRemoveSuccess, instanceRemoveError);
	};
	const instanceRemoveSuccess = (apiInstanceRemoveResponse) => {
		outputStatus.innerHTML = apiInstanceRemoveResponse.Status;
		loadInstances();
	};
	const instanceRemoveError = (exc) => {
		outputStatus.innerHTML = exc;
	};

	const instanceSee = (event, instance) => {
		window.location.href = "/api/instance/see?containerId=" + instance.ContainerId;
	};
	const instanceStatsSee = (event, instance) => {
		window.location.href = "/api/instance/stats-see?containerId=" + instance.ContainerId;
	};

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
		const networks = apiNetworksResponse.Data.Networks;
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true, class: 'interactive' });
		const grid = gridBuilder.build(
			networks,
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
		if (outputNetworks.querySelector('table'))
			outputNetworks.querySelector('table').remove();
		outputNetworks.appendChild(grid);
	};
	const showNetworksError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputNetworks, exc);
	};
	const networkInspectHref = (network) => {
		return '/api/network/inspect?networkId=' + network.NetworkId;
	};

	const showDiskUsages = (apiDiskUsagesResponse) => {
		const diskUsages = apiDiskUsagesResponse.Data.DiskUsages;
		const gridBuilder = new io.github.crisstanza.SimpleDataGrid({ border: true, headers: true });
		const grid = gridBuilder.build(
			diskUsages,
			[
				{ name: 'Type' },
				{ name: 'Total' },
				{ name: 'Active' },
				{ name: 'Size' },
				{ name: 'Reclaimable' }
			]
		);
		if (outputDiskUsages.querySelector('table'))
			outputDiskUsages.querySelector('table').remove();
		outputDiskUsages.appendChild(grid);
	};
	const showDiskUsagesError = (exc) => {
		io.github.crisstanza.Creator.html('span', {}, outputDiskUsages, exc);
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
	};
	const init = () => {
		initGui(0);
		initListeners();
	};

	window.addEventListener('load', init);
})();
