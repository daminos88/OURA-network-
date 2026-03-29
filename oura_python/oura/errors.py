class OuraError(Exception):
    pass

class InvalidBundleError(OuraError):
    pass

class InvalidSignatureError(OuraError):
    pass

class UnknownKeyIdError(OuraError):
    pass

class ExpiredBundleError(OuraError):
    pass
