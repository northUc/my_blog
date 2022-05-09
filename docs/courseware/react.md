## useFusionTable 解决了什么事情
> 封装了常用的 Fusion Form 与 Fusion Table 联动逻辑。
## useFusionTable 的实现
> 他也是基于`useAntdTable`来实现的,在此基础上增加一点变化, 同样他们也都是在`useRequest`的基础是现实的

- 首先从他的入口定义开始
```js
// ------------------------------ 入口
const useFusionTable = (
  service,
  options,
) => {
  const ret = useAntdTable<TData, TParams>(service, {
    ...options,
    form: options.field ? fieldAdapter(options.field) : undefined,
  });
  return resultAdapter(ret);
};

// ------------------------------ 区别
export const fieldAdapter = (field: Field) =>
  ({
    getFieldInstance: (name: string) => field.getNames().includes(name),
    setFieldsValue: field.setValues,
    getFieldsValue: field.getValues,
    resetFields: field.resetToDefault,
    validateFields: (fields, callback) => {
      field.validate(fields, callback);
    },
  } as AntdFormUtils);

export const resultAdapter = (result: any) => {
  const tableProps = {
    dataSource: result.tableProps.dataSource,
    loading: result.tableProps.loading,
    onSort: (dataIndex: string, order: string) => {
      ...........
    },
    onFilter: (filterParams: Object) => {
      ...........
    },
  };

  const paginationProps = {
    ...........
  };

  return {
    ...result,
    tableProps,
    paginationProps,
  };
};
```
- 这里看得出来`useFusionTable`就是依靠`useAntdTable`来处理的
- 区别:1、传入的参数`form`重写进行 2、对返回的数据进行了重写

## useAntdTable 的逻辑
- 首先从他的定义入手
```js
const useAntdTable = (
  service,
  options = {},
) => {
  const {
    form,
    defaultType = 'simple',
    defaultParams,
    manual = false,
    refreshDeps = [],
    ready = true,
    ...rest
  } = options;

  const result = usePagination<TData, TParams>(service, {
    manual: true,
    ...rest,
  });

  const { params = [], run } = result;

  const cacheFormTableData = params[2] || ({} as any);

  const [type, setType] = useState(cacheFormTableData?.type || defaultType);

  const allFormDataRef = useRef<Record<string, any>>({});

  const isAntdV4 = !!form?.getInternalHooks;

  // get current active field values
  const getActivetFieldValues = () => {
    ............
  };

  const validateFields = (): Promise<Record<string, any>> => {
    ............
  };

  const restoreForm = () => {
    ............
  };

  const changeType = () => {
    ........
  };

  const _submit = (initPagination?: TParams[0]) => {
    ............
  };

  const reset = () => {
    ............
  };

  const submit = (e?: any) => {
    ............
  };

  const onTableChange = (pagination: any, filters: any, sorter: any) => {
    ............
  };

  // init
  useEffect(() => {
    // if has cache, use cached params. ignore manual and ready.
    if (params.length > 0) {
      allFormDataRef.current = cacheFormTableData?.allFormData || {};
      restoreForm();
      // @ts-ignore
      run(...params);
      return;
    }
    if (!manual && ready) {
      allFormDataRef.current = defaultParams?.[1] || {};
      restoreForm();
      _submit(defaultParams?.[0]);
    }
  }, []);

  // change search type, restore form data
  useUpdateEffect(() => {
    if (!ready) {
      return;
    }
    restoreForm();
  }, [type]);

  // refresh & ready change on the same time
  const hasAutoRun = useRef(false);
  hasAutoRun.current = false;

  useUpdateEffect(() => {
    if (!manual && ready) {
      hasAutoRun.current = true;
      if (form) {
        form.resetFields();
      }
      allFormDataRef.current = defaultParams?.[1] || {};
      restoreForm();
      _submit(defaultParams?.[0]);
    }
  }, [ready]);

  useUpdateEffect(() => {
    if (hasAutoRun.current) {
      return;
    }
    if (!ready) {
      return;
    }
    if (!manual) {
      hasAutoRun.current = true;
      result.pagination.changeCurrent(1);
    }
  }, [...refreshDeps]);

  return {
    ...result,
    tableProps: {
      dataSource: result.data?.list || [],
      loading: result.loading,
      onChange: useMemoizedFn(onTableChange),
      pagination: {
        current: result.pagination.current,
        pageSize: result.pagination.pageSize,
        total: result.pagination.total,
      },
    },
    search: {
      submit: useMemoizedFn(submit),
      type,
      changeType: useMemoizedFn(changeType),
      reset: useMemoizedFn(reset),
    },
  } ;
};
```
- `useAntdTable`定义 从上往下看, 通过`usePagination`去请求数据实际 也就是`useRequest`,紧接着就是一些变量的一些收集,`isAntdV4`用来做兼容版本。这里定义了很多方法 后面我们分析。
- 接着就是初始化和依赖项的处理，`init` 处理了有参数执行`run`去请求数据,没有参数则用默认参数进行初始化。
- `refreshDeps`变会执行`result.pagination.changeCurrent(1)`重置 current 到第一页，并重新发起请求。 后面就是对表单和分页的初始化处理。
- 返回的数据 就是有三类，第一是`usePagination`请求返回的数据，第二类是表格的属性，第三类表单的操作，返回给用户使用
## 看看 表格操作
```js
const onTableChange = (pagination: any, filters: any, sorter: any) => {
    const [oldPaginationParams, ...restParams] = params || [];
    run(
      // @ts-ignore
      {
        ...oldPaginationParams,
        current: pagination.current,
        pageSize: pagination.pageSize,
        filters,
        sorter,
      },
      ...restParams,
    );
  };
```
- `dataSource`就是个table展示用的。`loading`兼容请求的状态。`pagination`给分页分参数。`onChange`其实就接受`pagination filters sorter`重新进行了一次请求

## 看看 表单操作
```js
  const reset = () => {
    if (form) {
      form.resetFields();
    }
    _submit();
  };

  const changeType = () => {
    const activeFieldsValue = getActivetFieldValues();
    allFormDataRef.current = {
      ...allFormDataRef.current,
      ...activeFieldsValue,
    };
    setType((t) => (t === 'simple' ? 'advance' : 'simple'));
  };

  const _submit = (initPagination?: TParams[0]) => {
    if (!ready) {
      return;
    }
    setTimeout(() => {
      validateFields()
        .then((values = {}) => {
          const pagination = initPagination || {
            pageSize: options.defaultPageSize || 10,
            ...(params?.[0] || {}),
            current: 1,
          };
          if (!form) {
            // @ts-ignore
            run(pagination);
            return;
          }

          // record all form data
          allFormDataRef.current = {
            ...allFormDataRef.current,
            ...values,
          };

          // @ts-ignore
          run(pagination, values, {
            allFormData: allFormDataRef.current,
            type,
          });
        })
        .catch((err) => err);
    });
  };

const submit = (e?: any) => {
    e?.preventDefault?.();
    _submit();
  };
```
- `submit` 首先表单进行校验,兼容了(antd3 antd4),然后拿到`pagination`对传入的参数和默认值进行了兼容,当有`form`存在时候`form`数据和`pagination`一起请求,否则只有`pagination`请求数据
- `changeType` 在切换类型的时候 做了一些初始化处理, 将已天写的数据保存了
- `reset` 这个就简单了 重置一组字段到 initialValues
## cacheKey 数据缓存 其实是利用的 `useRequest` 的缓存插件