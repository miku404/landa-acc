app.controller('akunCtrl', function ($scope, Data, $rootScope, $uibModal, Upload) {
    var tableStateRef;
    var control_link = "acc/m_akun";
    var master = 'Master Akun';
    $scope.formTitle = '';
    $scope.displayed = [];
    $scope.base_url = '';
    $scope.is_edit = false;
    $scope.is_view = false;

//    Data.get(control_link + '/cabang').then(function(data) {
//        $scope.cabang = data.data.data;
//    });

    $scope.master = master;
    $scope.callServer = function callServer(tableState) {
        tableStateRef = tableState;
        $scope.isLoading = true;
        var offset = tableState.pagination.start || 0;
        var limit = tableState.pagination.number || 1000;
        /** set offset and limit */
        var param = {};
        /** set sort and order */
        if (tableState.sort.predicate) {
            param['sort'] = tableState.sort.predicate;
            param['order'] = tableState.sort.reverse;
        }
        /** set filter */
        if (tableState.search.predicateObject) {
            param['filter'] = tableState.search.predicateObject;
        }
        Data.get('acc/m_klasifikasi/list').then(function (response) {
            $scope.dataakun = response.data.list;
        });
        Data.get(control_link + '/index', param).then(function (response) {
            $scope.displayed = response.data.list;
            $scope.base_url = response.data.base_url;
        });
        $scope.isLoading = false;
    };

    $scope.save_akun_kasir = function (val) {
        Data.post('acc/m_akun/save_akun_kasir', val).then(function (result) {
            if (result.status_code == 200) {
                toaster.pop('success', "Berhasil", "Data Berhasil Di Ubah");
            } else {
                toaster.pop('error', "Terjadi Kesalahan", "gagal mengubah Data");
            }
        });
    };
    $scope.getakun = function (id) {
        Data.get('acc/m_akun/getakun/' + id).then(function (data) {
            $scope.form.kode_induk = data.data.data.kode;
        });

    };
    /**import*/
    $scope.uploadFiles = function (file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            Data.get('site/url').then(function (data) {
                file.upload = Upload.upload({
                    url: data.data + 'acc/m_akun/import',
                    data: {
                        file: file
                    }
                });
                file.upload.then(function (response) {
                    var data = response.data;
                    if (data.status_code == 200) {
                        $scope.callServer(tableStateRef);
                        console.log("asw")
//                        toaster.pop('success', "Berhasil", "Data berhasil tersimpan");
                    } else {
                        toaster.pop('error', "Terjadi Kesalahan", "Data gagal di import");
                        console.log("asd")
                    }
                });
            });
        } else {
            toaster.pop('error', "Terjadi Kesalahan", result.errors);
        }
    };
    /**export*/
    $scope.export = function () {
        window.location = 'api/acc/m_akun/export';
    };
    /** create */
    $scope.create = function () {
        $scope.is_edit = true;
        $scope.is_view = false;
        $scope.is_create = true;
        $scope.is_disable = false;
        $scope.formtitle = master + " | Form Tambah Data";
        $scope.form = {};
        $scope.form.parent_id = '0';
    };
    /** update */
    $scope.update = function (form) {
        $scope.is_edit = true;
        $scope.is_view = false;
        $scope.is_update = true;
        $scope.is_disable = true;
        $scope.formtitle = master + " | Edit Data : " + form.nama;
        $scope.form = form;
    };
    /** view */
    $scope.view = function (form) {
        $scope.is_edit = true;
        $scope.is_view = true;
        $scope.is_disable = true;
        $scope.formtitle = master + " | Lihat Data : " + form.nama;
        $scope.form = form;
    };
    /** save action */
    $scope.save = function (form) {
        var url = (form.id > 0) ? '/update' : '/create';
        Data.post(control_link + url, form).then(function (result) {
            if (result.status_code == 200) {
                
                
                Swal.fire({
                        title:"Tersimpan", 
                        text:"Data Berhasil Di Simpan.", 
                        type:"success"
                    }).then(function (){
                        $scope.callServer(tableStateRef);
                        $scope.is_edit = false;
                    });
            } else {
                Swal.fire("Gagal", result.errors, "error");
            }
        });
    };
    /** cancel action */
    $scope.cancel = function () {
        if (!$scope.is_view) {
            $scope.callServer(tableStateRef);
        }
        $scope.is_edit = false;
        $scope.is_view = false;
    };
    $scope.trash = function (row) {
        var data = angular.copy(row);
        Swal.fire({
            title: "Peringatan ! ",
            text: "Apakah Anda Yakin Ingin Menghapus Data Ini",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Iya, di Hapus",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if(result.value){
                row.is_deleted = 1;
                Data.post(control_link + '/trash', row).then(function (result) {
                    Swal.fire({
                        title:"Terhapus", 
                        text:"Data Berhasil Di Hapus.", 
                        type:"success"
                    }).then(function (){
                        $scope.cancel();
                    });
                    
                });
            }
        });
    };
    $scope.restore = function (row) {
        var data = angular.copy(row);
        Swal.fire({
            title: "Peringatan ! ",
            text: "Apakah Anda Yakin Ingin Merestore Data Ini",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Iya, di Restore",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if(result.value){
                row.is_deleted = 0;
                Data.post(control_link + '/trash', row).then(function (result) {
                    Swal.fire({
                        title:"Restore", 
                        text:"Data Berhasil Di Restore.", 
                        type:"success"
                    }).then(function (){
                        $scope.cancel();
                    });
                    
                });
            }
        });
    };
    $scope.delete = function (row) {
        var data = angular.copy(row);
        Swal.fire({
            title: "Peringatan ! ",
            text: "Apakah Anda Yakin Ingin Menghapus Permanen Data Ini",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Iya, di Hapus",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if(result.value){
                row.is_deleted = 1;
                Data.post(control_link + '/delete', row).then(function (result) {
                    Swal.fire({
                        title:"Terhapus", 
                        text:"Data Berhasil Di Hapus Permanen.", 
                        type:"success"
                    }).then(function (){
                        $scope.cancel();
                    });
                    
                });
            }
        });
        
    };
    $scope.modalBudget = function(form){
      var modalInstance = $uibModal.open({
          templateUrl: "../acc_ukdc/api/acc/landa-acc/tpl/m_akun/modal.html",
          controller: "budgetCtrl",
          size: "md",
          backdrop: "static",
          keyboard: false,
          resolve: {
            form: form,
          }
      });

      modalInstance.result.then(function(response) {
        if(response.data == undefined){
        } else {
        }
      });
    }
});

app.controller("budgetCtrl", function($state, $scope, Data, $uibModalInstance, form) {
    $scope.form = form;
    $scope.listBudget = [];

    $scope.getBudget = function(tahun){
      var param = {
        tahun     : tahun,
        m_akun_id : $scope.form.id
      };

      if(tahun.toString().length > 3){
        Data.get('acc/m_akun/getBudget', param).then(function(result) {
          $scope.listBudget = result.data;
        });
      }
    }
//
    if($scope.listBudget.length == 0){
      var thisYear  = new Date();
      thisYear      = thisYear.getFullYear();
      $scope.getBudget(thisYear);
      $scope.form.tahun = thisYear;
    }
//
    $scope.save = function() {
      if($scope.form.tahun.toString().length < 3 ){
         Swal.fire({
                        title:"Required", 
                        text:"Anda harus mengisi tahun dengan benar", 
                        type:"error"
                    })
      } else {
        var params = {
          listBudget  : $scope.listBudget,
          form          : $scope.form
        };

        Data.post('acc/m_akun/saveBudget', params).then(function(result) {
          if (result.status_code == 200) {
              Swal.fire({
                        title:"Tersimpan", 
                        text:"Budget berhasil disimpan", 
                        type:"success"
                    }).then(function(){
                        $uibModalInstance.close( {'data' : result.data } );
                    })  
            
          } else {
              Swal.fire({
                        title:"Gagal", 
                        text:result.errors, 
                        type:"error"
                    })
          }
        });
      }
    };

    $scope.close = function() {
      $uibModalInstance.close({'data' : undefined });
    };

});
