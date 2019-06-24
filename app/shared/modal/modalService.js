wciApp.service("modalService", function ($uibModal) {
	const methods =
        {
        	open (options) {
        		return $uibModal.open(options);
        	},
        };

	return methods;
});
